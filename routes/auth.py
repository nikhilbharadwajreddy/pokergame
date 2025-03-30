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
            if not user_id:
                flash('Please create a User ID')
                return redirect(url_for('auth.login'))
            
            session['user_id'] = user_id
            
            # Check if user exists in MongoDB
            user_data = user_model.load_user_data(user_id)
            if not user_data.get('games'):
                # New user or no games
                user_model.save_user_data(user_id, {'user_id': user_id, 'players': [], 'groups': [], 'games': []})
                flash(f'New account created with ID: {user_id}')
            else:
                flash(f'Welcome back, {user_id}!')
            
            return redirect(url_for('dashboard.index'))
        
        return render_template('login.html')

    @auth_bp.route('/logout')
    def logout():
        session.pop('user_id', None)
        session.pop('admin', None)  # Also log out of admin
        return redirect(url_for('auth.login'))

    return auth_bp
