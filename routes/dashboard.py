from flask import Blueprint, render_template, session, redirect, url_for, request, flash
from functools import wraps

dashboard_bp = Blueprint('dashboard', __name__)

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated_function

def init_routes(user_model, game_model):
    """
    Initialize dashboard routes with user and game model dependencies.
    """
    @dashboard_bp.route('/')
    def home():
        if 'user_id' in session:
            return redirect(url_for('dashboard.index'))
        return redirect(url_for('auth.login'))

    @dashboard_bp.route('/dashboard')
    @login_required
    def index():
        user_id = session['user_id']
        user_data = user_model.load_user_data(user_id)
        return render_template('dashboard.html', 
                              user_data=user_data,
                              user_id=user_id)

    @dashboard_bp.route('/create_game', methods=['POST'])
    @login_required
    def create_game():
        user_id = session['user_id']
        game_name = request.form.get('game_name')
        
        game_id = game_model.create_game(user_id, game_name)
        flash(f'Created new game: {game_name or "Untitled Game"}')
        
        return redirect(url_for('game.view', game_id=game_id))

    return dashboard_bp
