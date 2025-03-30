from flask import Blueprint, render_template, request, redirect, url_for, session, flash
import os

admin_bp = Blueprint('admin', __name__)

def init_routes(user_model):
    """
    Initialize admin routes with user model dependency.
    """
    @admin_bp.route('/admin', methods=['GET', 'POST'])
    def admin():
        # Simple admin authentication with hardcoded password
        if request.method == 'POST' and 'password' in request.form:
            password = request.form.get('password')
            admin_password = os.environ.get('ADMIN_PASSWORD', 'admin123')  # Fallback to admin123 if env var not set
            if password == admin_password:
                session['admin'] = True
            else:
                flash('Invalid password')
                return redirect(url_for('admin.admin'))
        
        if 'admin' not in session:
            # Show login form
            return render_template('admin_login.html')
        
        # Get all users from MongoDB
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
        
        return render_template('admin.html', user_files=user_files)

    return admin_bp
