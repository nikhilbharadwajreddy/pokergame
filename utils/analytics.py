from datetime import datetime, timedelta
import json
import os

class Analytics:
    """
    Simple analytics tracker for the poker game application.
    
    This class provides methods to track and analyze user activity,
    game creation/usage, and other metrics.
    """
    
    def __init__(self, db=None):
        """
        Initialize the Analytics tracker with an optional MongoDB connection.
        
        If no database is provided, analytics will be stored in a local JSON file.
        """
        self.db = db
        self.events_collection = db["events"] if db else None
        self.local_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'analytics.json')
        
        # Ensure the local file exists
        if not self.db and not os.path.exists(self.local_file):
            # Create parent directory if it doesn't exist
            os.makedirs(os.path.dirname(self.local_file), exist_ok=True)
            
            # Create empty analytics file
            with open(self.local_file, 'w') as f:
                json.dump({
                    "events": [],
                    "daily_stats": {},
                    "user_stats": {}
                }, f)
    
    def track_event(self, event_type, user_id=None, data=None):
        """
        Track an event in the system.
        
        Parameters:
        - event_type: Type of event (e.g., 'login', 'game_created', 'settlement')
        - user_id: ID of the user who triggered the event (optional)
        - data: Additional data associated with the event (optional)
        """
        timestamp = datetime.now()
        event = {
            "event_type": event_type,
            "timestamp": timestamp,
            "user_id": user_id,
            "data": data or {}
        }
        
        if self.db:
            # Store in MongoDB
            self.events_collection.insert_one(event)
        else:
            # Store in local file
            try:
                with open(self.local_file, 'r') as f:
                    analytics_data = json.load(f)
                
                # Convert datetime to string for JSON serialization
                event["timestamp"] = event["timestamp"].isoformat()
                analytics_data["events"].append(event)
                
                # Update daily stats
                date_key = timestamp.strftime('%Y-%m-%d')
                daily_stats = analytics_data.get("daily_stats", {})
                day_stats = daily_stats.get(date_key, {"event_counts": {}, "user_count": 0, "new_users": []})
                
                # Update event counts
                event_counts = day_stats["event_counts"]
                event_counts[event_type] = event_counts.get(event_type, 0) + 1
                
                # Update user counts if user_id is provided
                if user_id:
                    user_stats = analytics_data.get("user_stats", {})
                    if user_id not in user_stats:
                        # New user
                        user_stats[user_id] = {
                            "first_seen": timestamp.isoformat(),
                            "last_seen": timestamp.isoformat(),
                            "event_count": 1,
                            "games_created": 0,
                            "settlements": 0
                        }
                        
                        # Add to new users for the day
                        if user_id not in day_stats["new_users"]:
                            day_stats["new_users"].append(user_id)
                    else:
                        # Existing user
                        user_stats[user_id]["last_seen"] = timestamp.isoformat()
                        user_stats[user_id]["event_count"] = user_stats[user_id].get("event_count", 0) + 1
                        
                    # Update specific event counters
                    if event_type == "game_created":
                        user_stats[user_id]["games_created"] = user_stats[user_id].get("games_created", 0) + 1
                    elif event_type == "settlement":
                        user_stats[user_id]["settlements"] = user_stats[user_id].get("settlements", 0) + 1
                    
                    # Update user stats in analytics_data
                    analytics_data["user_stats"] = user_stats
                
                # Update unique user count for the day
                active_users = set(day_stats.get("active_users", []))
                if user_id and user_id not in active_users:
                    active_users.add(user_id)
                    day_stats["active_users"] = list(active_users)
                    day_stats["user_count"] = len(active_users)
                
                # Update daily stats
                daily_stats[date_key] = day_stats
                analytics_data["daily_stats"] = daily_stats
                
                # Write updated data back to file
                with open(self.local_file, 'w') as f:
                    json.dump(analytics_data, f, indent=2)
            
            except Exception as e:
                print(f"Error tracking analytics event: {e}")
    
    def get_active_users(self, days=30):
        """
        Get the count of active users over a specified time period.
        
        Parameters:
        - days: Number of days to look back (default: 30)
        
        Returns:
        - List of [date, active_user_count] pairs for each day
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        result = []
        
        if self.db:
            # Query MongoDB for active users by day
            pipeline = [
                {
                    "$match": {
                        "timestamp": {"$gte": start_date, "$lte": end_date},
                        "user_id": {"$ne": None}
                    }
                },
                {
                    "$group": {
                        "_id": {
                            "year": {"$year": "$timestamp"},
                            "month": {"$month": "$timestamp"},
                            "day": {"$dayOfMonth": "$timestamp"},
                            "user_id": "$user_id"
                        }
                    }
                },
                {
                    "$group": {
                        "_id": {
                            "year": "$_id.year",
                            "month": "$_id.month",
                            "day": "$_id.day"
                        },
                        "count": {"$sum": 1}
                    }
                },
                {
                    "$sort": {"_id.year": 1, "_id.month": 1, "_id.day": 1}
                }
            ]
            
            for doc in self.events_collection.aggregate(pipeline):
                date_str = f"{doc['_id']['year']}-{doc['_id']['month']}-{doc['_id']['day']}"
                result.append([date_str, doc['count']])
        else:
            # Read from local file
            try:
                with open(self.local_file, 'r') as f:
                    analytics_data = json.load(f)
                
                daily_stats = analytics_data.get("daily_stats", {})
                
                # Generate all dates in range
                current_date = start_date
                while current_date <= end_date:
                    date_key = current_date.strftime('%Y-%m-%d')
                    day_stats = daily_stats.get(date_key, {})
                    active_users = day_stats.get("user_count", 0)
                    
                    # Add to result
                    result.append([date_key, active_users])
                    
                    # Move to next day
                    current_date += timedelta(days=1)
            
            except Exception as e:
                print(f"Error getting active users: {e}")
        
        return result
    
    def get_event_counts(self, days=30):
        """
        Get the count of different event types over a specified time period.
        
        Parameters:
        - days: Number of days to look back (default: 30)
        
        Returns:
        - Dictionary mapping event types to counts
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        event_counts = {}
        
        if self.db:
            # Query MongoDB for event counts
            pipeline = [
                {
                    "$match": {
                        "timestamp": {"$gte": start_date, "$lte": end_date}
                    }
                },
                {
                    "$group": {
                        "_id": "$event_type",
                        "count": {"$sum": 1}
                    }
                }
            ]
            
            for doc in self.events_collection.aggregate(pipeline):
                event_counts[doc['_id']] = doc['count']
        else:
            # Read from local file
            try:
                with open(self.local_file, 'r') as f:
                    analytics_data = json.load(f)
                
                daily_stats = analytics_data.get("daily_stats", {})
                
                # Calculate event counts across all days in range
                current_date = start_date
                while current_date <= end_date:
                    date_key = current_date.strftime('%Y-%m-%d')
                    day_stats = daily_stats.get(date_key, {})
                    day_event_counts = day_stats.get("event_counts", {})
                    
                    # Add counts to total
                    for event_type, count in day_event_counts.items():
                        event_counts[event_type] = event_counts.get(event_type, 0) + count
                    
                    # Move to next day
                    current_date += timedelta(days=1)
            
            except Exception as e:
                print(f"Error getting event counts: {e}")
        
        return event_counts
    
    def get_user_growth(self, months=6):
        """
        Get the count of new users by month for the specified period.
        
        Parameters:
        - months: Number of months to look back (default: 6)
        
        Returns:
        - List of [month, new_user_count] pairs for each month
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30 * months)
        result = []
        
        if self.db:
            # Query MongoDB for new users by month
            pipeline = [
                {
                    "$match": {
                        "timestamp": {"$gte": start_date, "$lte": end_date},
                        "event_type": "user_created"
                    }
                },
                {
                    "$group": {
                        "_id": {
                            "year": {"$year": "$timestamp"},
                            "month": {"$month": "$timestamp"}
                        },
                        "count": {"$sum": 1}
                    }
                },
                {
                    "$sort": {"_id.year": 1, "_id.month": 1}
                }
            ]
            
            for doc in self.events_collection.aggregate(pipeline):
                month_str = f"{doc['_id']['year']}-{doc['_id']['month']}"
                result.append([month_str, doc['count']])
        else:
            # Read from local file
            try:
                with open(self.local_file, 'r') as f:
                    analytics_data = json.load(f)
                
                # Group new users by month
                monthly_users = {}
                user_stats = analytics_data.get("user_stats", {})
                
                for user_id, stats in user_stats.items():
                    if "first_seen" in stats:
                        first_seen = datetime.fromisoformat(stats["first_seen"])
                        if first_seen >= start_date and first_seen <= end_date:
                            month_key = first_seen.strftime('%Y-%m')
                            monthly_users[month_key] = monthly_users.get(month_key, 0) + 1
                
                # Generate all months in range
                current_date = start_date.replace(day=1)
                while current_date <= end_date:
                    month_key = current_date.strftime('%Y-%m')
                    new_users = monthly_users.get(month_key, 0)
                    
                    # Add to result
                    result.append([month_key, new_users])
                    
                    # Move to next month
                    current_date = (current_date.replace(day=28) + timedelta(days=4)).replace(day=1)
            
            except Exception as e:
                print(f"Error getting user growth: {e}")
        
        return result
