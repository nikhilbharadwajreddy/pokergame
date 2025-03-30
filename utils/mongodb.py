from pymongo import MongoClient
import os
import urllib.parse

def get_mongodb_client():
    """
    Get a MongoDB client connection using credentials from environment or default values.
    """
    username = os.environ.get('MONGO_USERNAME', 'nikhilreddy')
    password = os.environ.get('MONGO_PASSWORD', 'admin123')
    encoded_password = urllib.parse.quote_plus(password)
    
    # Use the exact format from your connection string
    mongo_uri = os.environ.get(
        'MONGO_URI', 
        f'mongodb+srv://{username}:{encoded_password}@cluster0.kiaqj2n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&tlsAllowInvalidCertificates=true'
    )
    
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
