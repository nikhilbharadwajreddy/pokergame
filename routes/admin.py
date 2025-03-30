from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify, current_app
import os
from datetime import datetime, timedelta
import json
import random
from utils.config import ADMIN_PASSWORD, SYSTEM_NAME, DEFAULT_GAME_EXPIRATION_ENABLED, DEFAULT_BUY_IN

admin_bp = Blueprint('admin', __name__)

def init_routes(user_model):
    """
    Initialize admin routes with model dependencies.
    """
    # Admin authentication check - moved to individual routes for backward compatibility
    
    # Generate sample statistics data (would be replaced with real data in production)
    def generate_stats():
        # Get all users
        users = user_model.get_all_users()
        
        # Basic statistics
        total_users = len(users)
        total_games = sum(user.get('game_count', 0) for user in users)
        total_players = sum(user.get('player_count', 0) for user in users)
        active_users_today = random.randint(1, total_users)  # Simulated data
        
        return {
            'total_users': total_users,
            'total_games': total_games,
            'total_players': total_players,
            'active_users_today': active_users_today
        }
    
    # Generate sample activity data (would be replaced with real data in production)
    def generate_activity_data():
        # Generate last 30 days
        days = []
        active_users = []
        
        today = datetime.now()
        for i in range(30, 0, -1):
            date = today - timedelta(days=i)
            days.append(date.strftime('%b %d'))
            # Simulated user activity with some randomness
            active_users.append(random.randint(5, 25))
        
        return {
            'labels': days,
            'active_users': active_users
        }
    
    # Generate sample games distribution data (would be replaced with real data in production)
    def generate_games_distribution():
        # Game categories
        labels = ['1-10 Players', '11-20 Players', '21-30 Players', '31-40 Players', '41+ Players']
        # Make sure these are regular integers or floats, not custom objects or functions
        values = [random.randint(10, 50) for _ in range(len(labels))]
        
        return {
            'labels': labels,
            'values': values
        }
    
    # Generate sample user growth data (would be replaced with real data in production)
    def generate_user_growth():
        # Last 6 months
        months = []
        values = []
        
        today = datetime.now()
        for i in range(6, 0, -1):
            date = today.replace(day=1) - timedelta(days=1)
            date = date.replace(day=1)
            date = date - timedelta(days=30 * (i - 1))
            months.append(date.strftime('%b %Y'))
            values.append(random.randint(5, 30))
        
        return {
            'labels': months,
            'values': values
        }
    
    # Generate sample log data (would be replaced with real data in production)
    def generate_logs():
        log_types = ['info', 'warning', 'error']
        logs = []
        
        for i in range(10):
            log_type = random.choice(log_types)
            timestamp = (datetime.now() - timedelta(minutes=random.randint(1, 60))).strftime('%Y-%m-%d %H:%M:%S')
            
            if log_type == 'info':
                message = random.choice([
                    'User logged in successfully',
                    'Game created successfully',
                    'Settlement calculated',
                    'User updated profile'
                ])
            elif log_type == 'warning':
                message = random.choice([
                    'Failed login attempt',
                    'Game data validation warning',
                    'Database performance degraded',
                    'Cache miss rate increased'
                ])
            else:  # error
                message = random.choice([
                    'Database connection error',
                    'User data save failed',
                    'Game calculation error',
                    'API request timeout'
                ])
            
            logs.append({
                'level': log_type,
                'timestamp': timestamp,
                'message': message
            })
        
        return logs
    
    # Original admin route - for backward compatibility
    @admin_bp.route('/admin', methods=['GET', 'POST'])
    def admin():
        # Handle login
        if request.method == 'POST' and 'password' in request.form:
            password = request.form.get('password')
            if password and password == ADMIN_PASSWORD:
                session['admin'] = True
            else:
                flash('Invalid password')
                return redirect(url_for('admin.admin'))
        
        # Check if admin is logged in
        if 'admin' not in session:
            # Show login form
            return render_template('admin_login.html')
        
        # Get all users
        user_files = user_model.get_all_users()
        
        # Handle delete request
        if request.method == 'POST' and 'delete_user' in request.form:
            user_id = request.form.get('delete_user')
            success = user_model.delete_user(user_id)
            if success:
                flash(f'User {user_id} deleted successfully')
            else:
                flash(f'User {user_id} not found')
            return redirect(url_for('admin.admin'))
        
        # Handle view user request
        if request.args.get('view_user'):
            user_id = request.args.get('view_user')
            user_data = user_model.load_user_data(user_id)
            return render_template('admin_view_user.html', 
                                  user_id=user_id, 
                                  user_data=user_data)
        
        # If we get here, show the dashboard page
        return redirect(url_for('admin.dashboard'))
    
    # Admin login page
    @admin_bp.route('/admin/login', methods=['GET', 'POST'])
    def login():
        if request.method == 'POST' and 'password' in request.form:
            password = request.form.get('password')
            if password and password == ADMIN_PASSWORD:
                session['admin'] = True
                return redirect(url_for('admin.admin'))
            else:
                flash('Invalid password')
        
        return render_template('admin_login.html')
    
    # Admin logout
    @admin_bp.route('/admin/logout')
    def logout():
        if 'admin' in session:
            session.pop('admin')
        return redirect(url_for('admin.login'))
    
    # Admin dashboard page
    @admin_bp.route('/admin/dashboard')
    def dashboard():
        # Check if admin is logged in
        if 'admin' not in session:
            # Redirect to login
            return redirect(url_for('admin.admin'))
        
        # Generate sample data for the dashboard
        stats = generate_stats()
        user_activity = generate_activity_data()
        games_distribution = generate_games_distribution()
        user_growth = generate_user_growth()
        system_logs = generate_logs()
        
        # Pre-serialize the JSON for the charts to avoid serialization issues in the template
        import json
        try:
            # Create safe JSON strings for the charts
            user_activity_json = json.dumps({
                "labels": [str(x) for x in user_activity.get('labels', [])],
                "activeUsers": [int(x) for x in user_activity.get('active_users', [])]
            })
            
            games_distribution_json = json.dumps({
                "labels": [str(x) for x in games_distribution.get('labels', [])],
                "values": [int(x) for x in games_distribution.get('values', [])]
            })
            
            user_growth_json = json.dumps({
                "labels": [str(x) for x in user_growth.get('labels', [])],
                "values": [int(x) for x in user_growth.get('values', [])]
            })
        except (TypeError, ValueError) as e:
            # If any error occurs, provide safe default JSON strings
            print(f"Error creating chart data: {e}")
            user_activity_json = '{"labels":["Week 1","Week 2","Week 3","Week 4"],"activeUsers":[10,15,8,12]}'
            games_distribution_json = '{"labels":["Small Games","Medium Games","Large Games"],"values":[30,45,25]}'
            user_growth_json = '{"labels":["Jan","Feb","Mar","Apr","May","Jun"],"values":[5,7,10,12,15,18]}'
        
        # Sample recent activity
        recent_activity = [
            {'user_id': 'user1234', 'action': 'Created new game', 'timestamp': '2 hours ago'},
            {'user_id': 'user5678', 'action': 'Calculated settlement', 'timestamp': '3 hours ago'},
            {'user_id': 'user9012', 'action': 'Added new player', 'timestamp': '5 hours ago'},
            {'user_id': 'user3456', 'action': 'Updated profile', 'timestamp': '6 hours ago'},
            {'user_id': 'user7890', 'action': 'Exported settlement', 'timestamp': '8 hours ago'}
        ]
        
        # Global settings from config
        global_settings = {
            'default_game_expiration_enabled': DEFAULT_GAME_EXPIRATION_ENABLED,
            'default_buy_in': DEFAULT_BUY_IN,
            'system_name': SYSTEM_NAME,
            'maintenance_mode': os.environ.get('MAINTENANCE_MODE', 'off')
        }
        
        return render_template('admin_dashboard.html', 
                             stats=stats,
                             user_activity=user_activity,
                             games_distribution=games_distribution,
                             user_growth=user_growth,
                             system_logs=system_logs,
                             recent_activity=recent_activity,
                             global_settings=global_settings,
                             user_activity_json=user_activity_json,
                             games_distribution_json=games_distribution_json,
                             user_growth_json=user_growth_json)
    
    # Admin users list page
    @admin_bp.route('/admin/users')
    def users():
        # Check if admin is logged in
        if 'admin' not in session:
            return redirect(url_for('admin.admin'))
        
        # Get all users
        user_files = user_model.get_all_users()
        
        # Sample data for most active users
        active_users = []
        for i in range(min(5, len(user_files))):
            user = user_files[i]
            active_users.append({
                'user_id': user.get('user_id'),
                'last_active': user.get('modified_date'),
                'game_count': user.get('game_count'),
                'activity_score': random.randint(60, 100)  # Simulated score
            })
        
        # Sample data for recently created users
        recent_users = []
        for i in range(min(5, len(user_files))):
            user = user_files[i]
            recent_users.append({
                'user_id': user.get('user_id'),
                'created_date': user.get('modified_date')
            })
        
        return render_template('admin_users.html', 
                             user_files=user_files,
                             active_users=active_users,
                             recent_users=recent_users)
    
    # View single user
    @admin_bp.route('/admin/users/<user_id>')
    def view_user(user_id):
        # Check if admin is logged in
        if 'admin' not in session:
            return redirect(url_for('admin.admin'))
        
        user_data = user_model.load_user_data(user_id)
        if not user_data:
            flash(f'User {user_id} not found')
            return redirect(url_for('admin.users'))
        
        return render_template('admin_view_user.html', 
                             user_id=user_id, 
                             user_data=user_data)
    
    # Delete user
    @admin_bp.route('/admin/delete_user', methods=['POST'])
    def delete_user():
        # Check if admin is logged in
        if 'admin' not in session:
            return redirect(url_for('admin.admin'))
        
        user_id = request.form.get('user_id')
        if not user_id:
            flash('User ID is required')
            return redirect(url_for('admin.users'))
        
        success = user_model.delete_user(user_id)
        if success:
            flash(f'User {user_id} deleted successfully')
        else:
            flash(f'User {user_id} not found')
        
        return redirect(url_for('admin.users'))
    
    # Update user setting
    @admin_bp.route('/admin/update_user_setting', methods=['POST'])
    def update_user_setting():
        user_id = request.form.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'User ID is required'})
        
        # Get the game_expiration_enabled setting
        game_expiration_enabled = 'game_expiration_enabled' in request.form
        
        # Update the user setting
        success = user_model.update_user_setting(user_id, 'game_expiration_enabled', game_expiration_enabled)
        
        if success:
            return jsonify({'success': True, 'message': f'Settings updated for {user_id}'})
        else:
            return jsonify({'success': False, 'error': f'Error updating settings for {user_id}'})
    
    # Update global settings
    @admin_bp.route('/admin/update_global_settings', methods=['POST'])
    def update_global_settings():
        # Check if admin is logged in
        if 'admin' not in session:
            return jsonify({'success': False, 'error': 'Admin access required'})
        
        # In a real application, these would be saved to a database or config file
        # For demo purposes, we'll just return success
        return jsonify({'success': True, 'message': 'Global settings updated successfully'})
    
    # Admin system logs
    @admin_bp.route('/admin/logs')
    def logs():
        # Check if admin is logged in
        if 'admin' not in session:
            return redirect(url_for('admin.admin'))
        
        # Get filters from query parameters
        level = request.args.get('level', 'all')
        date = request.args.get('date', '')
        search = request.args.get('search', '')
        page = int(request.args.get('page', 1))
        
        # Generate sample logs
        all_logs = []
        log_types = ['info', 'warning', 'error']
        log_sources = ['server', 'database', 'application', 'auth']
        
        for i in range(50):  # Generate 50 sample logs
            log_type = random.choice(log_types)
            log_date = datetime.now() - timedelta(days=random.randint(0, 30))
            timestamp = log_date.strftime('%Y-%m-%d %H:%M:%S')
            date_str = log_date.strftime('%Y-%m-%d')
            
            if log_type == 'info':
                message = random.choice([
                    'User logged in successfully',
                    'Game created successfully',
                    'Settlement calculated',
                    'User updated profile'
                ])
            elif log_type == 'warning':
                message = random.choice([
                    'Failed login attempt',
                    'Game data validation warning',
                    'Database performance degraded',
                    'Cache miss rate increased'
                ])
            else:  # error
                message = random.choice([
                    'Database connection error',
                    'User data save failed',
                    'Game calculation error',
                    'API request timeout'
                ])
            
            # Add details for some logs
            details = None
            if random.random() < 0.3:  # 30% chance to have details
                if log_type == 'error':
                    details = 'Error details:\n' + ''.join(random.choices('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=100))
                else:
                    details = 'Additional information:\n' + ''.join(random.choices('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=50))
            
            all_logs.append({
                'level': log_type,
                'timestamp': timestamp,
                'date': date_str,
                'message': message,
                'source': random.choice(log_sources),
                'details': details
            })
        
        # Apply filters
        filtered_logs = all_logs
        if level != 'all':
            filtered_logs = [log for log in filtered_logs if log['level'] == level]
        if date:
            filtered_logs = [log for log in filtered_logs if log['date'] == date]
        if search:
            filtered_logs = [log for log in filtered_logs if search.lower() in log['message'].lower()]
        
        # Pagination
        items_per_page = 10
        total_items = len(filtered_logs)
        total_pages = (total_items + items_per_page - 1) // items_per_page
        
        # Ensure page is within valid range
        page = max(1, min(page, total_pages if total_pages > 0 else 1))
        
        # Get logs for the current page
        start_idx = (page - 1) * items_per_page
        end_idx = min(start_idx + items_per_page, total_items)
        page_logs = filtered_logs[start_idx:end_idx]
        
        return render_template('admin_logs.html',
                             logs=page_logs,
                             page=page,
                             total_pages=total_pages,
                             level=level,
                             date=date,
                             search=search)
    
    # Clear cache
    @admin_bp.route('/admin/clear_cache', methods=['POST'])
    def clear_cache():
        # Check if admin is logged in
        if 'admin' not in session:
            return redirect(url_for('admin.admin'))
        
        # In a real application, this would clear application cache
        # For demo purposes, we'll just redirect with a success message
        flash('Application cache cleared successfully')
        return redirect(url_for('admin.dashboard'))
    
    # Clear logs
    @admin_bp.route('/admin/logs/clear', methods=['POST'])
    def clear_logs():
        # Check if admin is logged in
        if 'admin' not in session:
            return redirect(url_for('admin.admin'))
        
        # In a real application, this would clear logs from the database
        # For demo purposes, we'll just redirect with a success message
        flash('All logs cleared successfully')
        return redirect(url_for('admin.logs'))
    
    # Export logs
    @admin_bp.route('/admin/logs/export')
    def export_logs():
        # Check if admin is logged in
        if 'admin' not in session:
            return redirect(url_for('admin.admin'))
        
        # In a real application, this would generate a CSV or JSON file for download
        # For demo purposes, we'll just redirect with a success message
        flash('Log export functionality would be implemented here')
        return redirect(url_for('admin.logs'))
    
    # Export user data
    @admin_bp.route('/admin/export')
    def export_user_data():
        # Check if admin is logged in
        if 'admin' not in session:
            return redirect(url_for('admin.admin'))
        
        # In a real application, this would generate a CSV or JSON file for download
        # For demo purposes, we'll just redirect with a success message
        flash('User data export functionality would be implemented here')
        return redirect(url_for('admin.users'))

    return admin_bp
