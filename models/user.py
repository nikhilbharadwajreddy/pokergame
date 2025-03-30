from datetime import datetime

class UserModel:
    def __init__(self, db=None):
        """
        Initialize the User model with database connection.
        """
        self.db = db
        self.users_collection = db["users"] if db else None
    
    def save_user_data(self, user_id, data):
        """
        Save user data to the database.
        """
        if not self.users_collection:
            return False
            
        # Ensure user_id is part of the data
        data['user_id'] = user_id
        
        # Add last_modified timestamp
        data['last_modified'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Remove MongoDB _id field if it exists (to avoid conflicts on update)
        if '_id' in data:
            del data['_id']
        
        # Use upsert to create if not exists
        result = self.users_collection.update_one(
            {"user_id": user_id},
            {"$set": data},
            upsert=True
        )
        
        return result.acknowledged
    
    def load_user_data(self, user_id):
        """
        Load user data from the database.
        """
        if not self.users_collection:
            return {'user_id': user_id, 'players': [], 'groups': [], 'games': []}
        
        user_data = self.users_collection.find_one({"user_id": user_id})
        if not user_data:
            return {'user_id': user_id, 'players': [], 'groups': [], 'games': []}
        
        # Convert MongoDB ObjectId to string for JSON serialization
        if '_id' in user_data:
            user_data['_id'] = str(user_data['_id'])
            
        return user_data
    
    def delete_user(self, user_id):
        """
        Delete a user from the database.
        """
        if not self.users_collection:
            return False
            
        result = self.users_collection.delete_one({"user_id": user_id})
        return result.deleted_count > 0
    
    def get_all_users(self):
        """
        Get all users from the database.
        """
        if not self.users_collection:
            return []
            
        users = []
        for user in self.users_collection.find():
            # Convert MongoDB ObjectId to string for display
            if '_id' in user:
                user['_id'] = str(user['_id'])
                
            # Get statistics
            game_count = len(user.get('games', []))
            player_count = len(user.get('players', []))
            
            # Check if user has last_modified field, if not, use current time
            modified_date = user.get('last_modified', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
            
            users.append({
                'user_id': user.get('user_id'),
                'modified_date': modified_date,
                'game_count': game_count,
                'player_count': player_count
            })
            
        # Sort by modified date (newest first)
        users.sort(key=lambda x: x['modified_date'], reverse=True)
        
        return users
