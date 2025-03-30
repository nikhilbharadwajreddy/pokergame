import json
import os
from datetime import datetime

class Settings:
    """
    Global settings manager for the poker game application.
    
    This class provides methods to read and update global application settings.
    Settings can be stored in MongoDB or in a local JSON file.
    """
    
    def __init__(self, db=None):
        """
        Initialize the Settings manager with an optional MongoDB connection.
        
        If no database is provided, settings will be stored in a local JSON file.
        """
        self.db = db
        self.settings_collection = db["settings"] if db else None
        self.local_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'settings.json')
        
        # Default settings
        self.default_settings = {
            "default_game_expiration_enabled": True,
            "default_buy_in": 10,
            "system_name": "Poker Settle",
            "maintenance_mode": "off",
            "allow_user_registration": True,
            "max_players_per_game": 20,
            "max_games_per_user": 50,
            "session_timeout_minutes": 60,
            "require_email_verification": False,
            "hide_credit_in_exports": False,
            "last_updated": datetime.now().isoformat(),
            "updated_by": "system"
        }
        
        # Ensure the local file exists
        if not self.db and not os.path.exists(self.local_file):
            # Create parent directory if it doesn't exist
            os.makedirs(os.path.dirname(self.local_file), exist_ok=True)
            
            # Create settings file with default values
            with open(self.local_file, 'w') as f:
                json.dump(self.default_settings, f, indent=2)
    
    def get_all_settings(self):
        """
        Get all application settings.
        
        Returns:
        - Dictionary of all settings
        """
        if self.db:
            # Get from MongoDB
            settings_doc = self.settings_collection.find_one({"_id": "global_settings"})
            if settings_doc:
                # Remove MongoDB _id field for cleaner output
                if '_id' in settings_doc:
                    del settings_doc['_id']
                return settings_doc
            else:
                # No settings found, create default and return
                self.settings_collection.insert_one({
                    "_id": "global_settings",
                    **self.default_settings
                })
                return self.default_settings
        else:
            # Get from local file
            try:
                with open(self.local_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error reading settings file: {e}")
                return self.default_settings
    
    def get_setting(self, key, default=None):
        """
        Get a specific setting value.
        
        Parameters:
        - key: Setting key to retrieve
        - default: Default value if setting is not found
        
        Returns:
        - Setting value or default
        """
        settings = self.get_all_settings()
        return settings.get(key, default)
    
    def update_settings(self, new_settings, updated_by="admin"):
        """
        Update multiple settings at once.
        
        Parameters:
        - new_settings: Dictionary of settings to update
        - updated_by: Identifier of who made the changes
        
        Returns:
        - Boolean indicating success
        """
        try:
            # Get current settings
            current_settings = self.get_all_settings()
            
            # Update with new values
            current_settings.update(new_settings)
            
            # Add metadata
            current_settings["last_updated"] = datetime.now().isoformat()
            current_settings["updated_by"] = updated_by
            
            if self.db:
                # Update in MongoDB
                self.settings_collection.update_one(
                    {"_id": "global_settings"},
                    {"$set": current_settings},
                    upsert=True
                )
            else:
                # Update local file
                with open(self.local_file, 'w') as f:
                    json.dump(current_settings, f, indent=2)
            
            return True
        except Exception as e:
            print(f"Error updating settings: {e}")
            return False
    
    def update_setting(self, key, value, updated_by="admin"):
        """
        Update a single setting.
        
        Parameters:
        - key: Setting key to update
        - value: New value for the setting
        - updated_by: Identifier of who made the change
        
        Returns:
        - Boolean indicating success
        """
        return self.update_settings({key: value}, updated_by)
    
    def reset_to_defaults(self, updated_by="admin"):
        """
        Reset all settings to default values.
        
        Parameters:
        - updated_by: Identifier of who made the change
        
        Returns:
        - Boolean indicating success
        """
        try:
            # Update default settings metadata
            default_settings = self.default_settings.copy()
            default_settings["last_updated"] = datetime.now().isoformat()
            default_settings["updated_by"] = updated_by
            
            if self.db:
                # Reset in MongoDB
                self.settings_collection.update_one(
                    {"_id": "global_settings"},
                    {"$set": default_settings},
                    upsert=True
                )
            else:
                # Reset local file
                with open(self.local_file, 'w') as f:
                    json.dump(default_settings, f, indent=2)
            
            return True
        except Exception as e:
            print(f"Error resetting settings: {e}")
            return False
