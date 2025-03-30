import json
import os
from datetime import datetime
import traceback

class Logger:
    """
    System logger for the poker game application.
    
    This class provides methods to log events, errors, and other system messages.
    Logs can be stored in MongoDB or in a local JSON file.
    """
    
    def __init__(self, db=None):
        """
        Initialize the Logger with an optional MongoDB connection.
        
        If no database is provided, logs will be stored in a local JSON file.
        """
        self.db = db
        self.logs_collection = db["system_logs"] if db else None
        self.local_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'system_logs.json')
        
        # Ensure the local file exists
        if not self.db and not os.path.exists(self.local_file):
            # Create parent directory if it doesn't exist
            os.makedirs(os.path.dirname(self.local_file), exist_ok=True)
            
            # Create empty logs file
            with open(self.local_file, 'w') as f:
                json.dump({"logs": []}, f)
    
    def log(self, level, message, source=None, user_id=None, details=None):
        """
        Log a message with the specified level.
        
        Parameters:
        - level: Log level ('info', 'warning', 'error')
        - message: Log message text
        - source: Source of the log (e.g., 'auth', 'game', 'database')
        - user_id: ID of the user related to the log (if applicable)
        - details: Additional details as a string or dictionary
        
        Returns:
        - Boolean indicating success
        """
        timestamp = datetime.now()
        log_entry = {
            "level": level,
            "message": message,
            "timestamp": timestamp,
            "source": source,
            "user_id": user_id,
            "details": details
        }
        
        try:
            if self.db:
                # Store in MongoDB
                self.logs_collection.insert_one(log_entry)
            else:
                # Store in local file
                try:
                    # Read current logs
                    with open(self.local_file, 'r') as f:
                        logs_data = json.load(f)
                    
                    # Convert timestamp to string for JSON serialization
                    log_entry["timestamp"] = log_entry["timestamp"].isoformat()
                    
                    # Add new log entry
                    logs_data["logs"].append(log_entry)
                    
                    # Write updated logs back to file
                    with open(self.local_file, 'w') as f:
                        json.dump(logs_data, f, indent=2)
                    
                except Exception as e:
                    print(f"Error writing to log file: {e}")
                    return False
            
            return True
        except Exception as e:
            print(f"Error logging message: {e}")
            return False
    
    def info(self, message, source=None, user_id=None, details=None):
        """
        Log an info message.
        
        Parameters:
        - message: Log message text
        - source: Source of the log (e.g., 'auth', 'game', 'database')
        - user_id: ID of the user related to the log (if applicable)
        - details: Additional details as a string or dictionary
        
        Returns:
        - Boolean indicating success
        """
        return self.log('info', message, source, user_id, details)
    
    def warning(self, message, source=None, user_id=None, details=None):
        """
        Log a warning message.
        
        Parameters:
        - message: Log message text
        - source: Source of the log (e.g., 'auth', 'game', 'database')
        - user_id: ID of the user related to the log (if applicable)
        - details: Additional details as a string or dictionary
        
        Returns:
        - Boolean indicating success
        """
        return self.log('warning', message, source, user_id, details)
    
    def error(self, message, source=None, user_id=None, details=None):
        """
        Log an error message.
        
        Parameters:
        - message: Log message text
        - source: Source of the log (e.g., 'auth', 'game', 'database')
        - user_id: ID of the user related to the log (if applicable)
        - details: Additional details as a string or dictionary
        
        Returns:
        - Boolean indicating success
        """
        return self.log('error', message, source, user_id, details)
    
    def exception(self, e, message=None, source=None, user_id=None):
        """
        Log an exception with traceback.
        
        Parameters:
        - e: Exception object
        - message: Optional message to include (if None, exception message is used)
        - source: Source of the log (e.g., 'auth', 'game', 'database')
        - user_id: ID of the user related to the log (if applicable)
        
        Returns:
        - Boolean indicating success
        """
        if message is None:
            message = str(e)
        
        # Get traceback as string
        tb_str = traceback.format_exc()
        
        # Create details with exception info
        details = {
            "exception_type": type(e).__name__,
            "exception_message": str(e),
            "traceback": tb_str
        }
        
        return self.error(message, source, user_id, details)
    
    def get_logs(self, level=None, source=None, user_id=None, limit=100, skip=0, start_date=None, end_date=None):
        """
        Get logs with optional filtering.
        
        Parameters:
        - level: Filter by log level ('info', 'warning', 'error')
        - source: Filter by log source
        - user_id: Filter by user ID
        - limit: Maximum number of logs to return
        - skip: Number of logs to skip (for pagination)
        - start_date: Start date for filtering
        - end_date: End date for filtering
        
        Returns:
        - List of log entries
        """
        if self.db:
            # Query MongoDB for logs
            query = {}
            if level:
                query["level"] = level
            if source:
                query["source"] = source
            if user_id:
                query["user_id"] = user_id
            if start_date or end_date:
                query["timestamp"] = {}
                if start_date:
                    query["timestamp"]["$gte"] = start_date
                if end_date:
                    query["timestamp"]["$lte"] = end_date
            
            # Execute query
            cursor = self.logs_collection.find(query).sort("timestamp", -1).skip(skip).limit(limit)
            
            # Convert cursor to list and process each log
            logs = []
            for log in cursor:
                # Convert MongoDB _id to string for JSON serialization
                log["_id"] = str(log["_id"])
                logs.append(log)
            
            return logs
        else:
            # Read from local file
            try:
                with open(self.local_file, 'r') as f:
                    logs_data = json.load(f)
                
                logs = logs_data.get("logs", [])
                
                # Apply filters
                filtered_logs = logs
                if level:
                    filtered_logs = [log for log in filtered_logs if log.get("level") == level]
                if source:
                    filtered_logs = [log for log in filtered_logs if log.get("source") == source]
                if user_id:
                    filtered_logs = [log for log in filtered_logs if log.get("user_id") == user_id]
                if start_date:
                    start_date_str = start_date.isoformat() if isinstance(start_date, datetime) else start_date
                    filtered_logs = [log for log in filtered_logs if log.get("timestamp", "") >= start_date_str]
                if end_date:
                    end_date_str = end_date.isoformat() if isinstance(end_date, datetime) else end_date
                    filtered_logs = [log for log in filtered_logs if log.get("timestamp", "") <= end_date_str]
                
                # Sort by timestamp (newest first)
                filtered_logs.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
                
                # Apply pagination
                paginated_logs = filtered_logs[skip:skip + limit]
                
                return paginated_logs
            
            except Exception as e:
                print(f"Error getting logs: {e}")
                return []
    
    def clear_logs(self):
        """
        Clear all logs.
        
        Returns:
        - Boolean indicating success
        """
        try:
            if self.db:
                # Clear logs in MongoDB
                self.logs_collection.delete_many({})
            else:
                # Clear logs in local file
                with open(self.local_file, 'w') as f:
                    json.dump({"logs": []}, f)
            
            return True
        except Exception as e:
            print(f"Error clearing logs: {e}")
            return False
