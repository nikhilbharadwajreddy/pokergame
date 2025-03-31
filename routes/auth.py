from flask import Blueprint, render_template, request, redirect, url_for, session, flash

auth_bp = Blueprint('auth', __name__)

def init_routes(user_model):
    """
    Initialize authentication routes with user model dependency.
    """
    @auth_bp.route('/login', methods=['GET', 'POST'])
    def login():
        if request.method == 'POST':
            user_id = request.form.get('user_id')
            passcode = request.form.get('passcode')
            
            if not user_id:
                flash('Please create a User ID')
                return redirect(url_for('auth.login'))
                
            if not passcode or not passcode.isdigit() or len(passcode) < 4 or len(passcode) > 6:
                flash('Please enter a 4-6 digit numeric passcode')
                return redirect(url_for('auth.login'))
            
            # Check if user exists in MongoDB
            user_data = user_model.load_user_data(user_id)
            
            # If user exists, check passcode
            if user_data.get('games') and user_data.get('passcode'):
                # Existing user with passcode
                if user_data['passcode'] != passcode:
                    flash('Invalid passcode')
                    return redirect(url_for('auth.login'))
                
                session['user_id'] = user_id
                flash(f'Welcome back, {user_id}!')
            else:
                # New user or user without passcode
                user_data = user_data if user_data else {'user_id': user_id, 'players': [], 'groups': [], 'games': []}
                user_data['passcode'] = passcode
                user_model.save_user_data(user_id, user_data)
                
                session['user_id'] = user_id
                flash(f'New account created with ID: {user_id}')
            
            return redirect(url_for('dashboard.index'))
        
        return render_template('login.html')

    @auth_bp.route('/logout')
    def logout():
        session.pop('user_id', None)
        session.pop('admin', None)  # Also log out of admin
        return redirect(url_for('auth.login'))

    return auth_bp
