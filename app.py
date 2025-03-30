from flask import Flask, redirect, url_for, jsonify
import os

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

def create_app():
    """
    Factory function to create Flask app with all dependencies.
    """
    app = Flask(__name__)
    app.secret_key = os.environ.get('SECRET_KEY', 'default-secret-key')
    
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
    app.run(debug=True)
