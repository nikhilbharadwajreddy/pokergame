from pymongo import MongoClient
import logging
import json
import os
from .config import get_mongodb_connection_string, DATA_DIR

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

def get_mongodb_client():
    """
    Get a MongoDB client connection using credentials from environment.
    If connection fails, provide a fallback warning but let the app work with local JSON files.
    """
    mongo_uri = get_mongodb_connection_string()
    
    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)  # 5 second timeout
        # Test connection
        client.admin.command('ping')
        print("MongoDB connection successful!")
        return client
    except Exception as e:
        print(f"Error connecting to MongoDB: {str(e)}")
        print("⚠️ USING LOCAL FILE STORAGE FOR DEVELOPMENT ONLY!")
        print(f"Data will be stored in {DATA_DIR}")
        # Return None to indicate connection failure
        return None
