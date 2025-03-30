from flask import Flask, redirect, url_for, jsonify, current_app
import os
import logging
from load_env import load_dotenv

# Load environment variables from .env file in development
if os.environ.get('APP_ENV', 'development') == 'development':
    load_dotenv()

# Import models
from models.user import UserModel
from models.game import GameModel 
from models.settlement import SettlementModel

# Import routes
from routes.auth import auth_bp, init_routes as init_auth_routes
from routes.dashboard import dashboard_bp, init_routes as init_dashboard_routes
from routes.game import game_bp, init_routes as init_game_routes
from routes.admin import admin_bp, init_routes as init_admin_routes

# Import utilities
from utils.mongodb import get_mongodb_client
from utils.analytics import Analytics
from utils.settings import Settings
from utils.logger import Logger
from utils.config import *

def create_app():
    """
    Factory function to create Flask app with all dependencies.
    """
    app = Flask(__name__)
    
    # Configure app from our centralized config
    app.secret_key = SECRET_KEY
    app.config['SESSION_COOKIE_SECURE'] = SESSION_COOKIE_SECURE
    app.config['SESSION_COOKIE_HTTPONLY'] = SESSION_COOKIE_HTTPONLY
    app.config['SESSION_COOKIE_SAMESITE'] = SESSION_COOKIE_SAMESITE
    
    # Set up logging
    if not app.debug:
        handler = logging.StreamHandler()
        handler.setLevel(logging.INFO)
        app.logger.addHandler(handler)
    
    # Validate config in production
    warnings = validate_config()
    for warning in warnings:
        app.logger.warning(f"Configuration warning: {warning}")
    
    # Initialize MongoDB client
    mongo_client = get_mongodb_client()
    if mongo_client:
        db = mongo_client["poker_game"]
    else:
        db = None
        print("Warning: Database connection failed. App will run with limited functionality.")
    
    # Initialize models with dependencies
    user_model = UserModel(db)
    game_model = GameModel(user_model)
    settlement_model = SettlementModel(user_model, game_model)
    
    # Initialize routes with dependencies
    auth_routes = init_auth_routes(user_model)
    dashboard_routes = init_dashboard_routes(user_model, game_model, settlement_model)
    game_routes = init_game_routes(user_model, game_model, settlement_model)
    admin_routes = init_admin_routes(user_model)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(game_bp)
    app.register_blueprint(admin_bp)
    
    # Health check endpoint for Fly.io
    @app.route('/healthcheck')
    def healthcheck():
        return jsonify({'status': 'ok'})
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=DEBUG)
