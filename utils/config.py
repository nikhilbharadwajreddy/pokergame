"""
Central configuration and secrets management for the Poker Game application.
This file loads configuration from environment variables with secure defaults.
"""

import os
import secrets

# Application environment
APP_ENV = os.environ.get('APP_ENV', 'development')
DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'

# Security settings
SECRET_KEY = os.environ.get('SECRET_KEY', secrets.token_hex(32))
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', None)
SESSION_COOKIE_SECURE = APP_ENV == 'production'
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'

# MongoDB settings (Cloud only)
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb+srv://nikhilreddy:admin123@cluster0.kiaqj2n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&tlsAllowInvalidCertificates=true')

# Application settings
DATA_DIR = os.environ.get('DATA_DIR', os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data'))
PORT = int(os.environ.get('PORT', 8080))

# Default game settings
DEFAULT_GAME_EXPIRATION_ENABLED = os.environ.get('DEFAULT_GAME_EXPIRATION', 'True').lower() == 'true'
DEFAULT_BUY_IN = float(os.environ.get('DEFAULT_BUY_IN', '10.0'))
SYSTEM_NAME = os.environ.get('SYSTEM_NAME', 'Poker Settle')

def get_mongodb_connection_string():
    """
    Get MongoDB connection string from environment variables.
    Only uses MONGO_URI directly as we only support cloud MongoDB.
    """
    return MONGO_URI

def validate_config():
    """
    Validate that critical configuration is available.
    """
    if APP_ENV == 'production':
        warnings = []
        
        if not SECRET_KEY or SECRET_KEY == secrets.token_hex(32):
            warnings.append("SECRET_KEY is not explicitly set")
        
        if not ADMIN_PASSWORD:
            warnings.append("ADMIN_PASSWORD is not set")
            
        if 'username:password' in MONGO_URI or not MONGO_URI:
            warnings.append("Default MongoDB URI is being used. Please set a real connection string.")
        
        return warnings
    
    return []
