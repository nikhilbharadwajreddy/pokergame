from pymongo import MongoClient
import logging
from .config import get_mongodb_connection_string

def get_mongodb_client():
    """
    Get a MongoDB client connection using credentials from environment or default values.
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
        # Return None to indicate connection failure
        return None
