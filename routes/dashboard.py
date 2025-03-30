from flask import Blueprint, render_template, session, redirect, url_for, request, flash, jsonify
from datetime import datetime
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

def init_routes(user_model, game_model, settlement_model=None):
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


        
    @dashboard_bp.route('/save_settlement_history', methods=['POST'])
    @login_required
    def save_settlement_history():
        user_id = session['user_id']
        game_id = request.json.get('game_id')
        settlement_data = request.json.get('settlement_data')
        player_id = request.json.get('player_id')  # Optional: specific player to mark as settled
        
        if not game_id or not settlement_data:
            return jsonify({'success': False, 'error': 'Missing required data'})
        
        # Load user data
        user_data = user_model.load_user_data(user_id)
        
        # Find the game
        game = next((g for g in user_data['games'] if g['game_id'] == game_id), None)
        if not game:
            return jsonify({'success': False, 'error': 'Game not found'})
            
        # Initialize settlement_history if it doesn't exist
        if 'settlement_history' not in user_data:
            user_data['settlement_history'] = []

        # Check if this game already has a settlement history entry
        existing_entry = next((entry for entry in user_data['settlement_history'] 
                              if entry.get('game_name') == game.get('game_name')), None)
        
        if existing_entry:
            # Update the existing entry instead of creating a new one
            existing_entry['date'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            existing_entry['game_id'] = game_id
            existing_entry['settlement_data'] = settlement_data
            history_id = existing_entry['id']
        else:
            # Create a new history entry
            history_id = str(len(user_data.get('settlement_history', [])) + 1)
            history_entry = {
                'id': history_id,
                'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'game_name': game.get('game_name'),
                'game_id': game_id,
                'settlement_data': settlement_data
            }
            # Add the new history entry
            user_data['settlement_history'].append(history_entry)
        
        # Handle player settlement: If specific player_id provided, mark only that player
        # Otherwise if no player_id, it means "settle all"
        if player_id:
            # Mark specific player as settled
            player = next((p for p in game['players'] if p['name'] == player_id), None)
            if player:
                if 'is_settled' not in player:
                    player['is_settled'] = True
        else:
            # Mark all players as settled
            for player in game['players']:
                player['is_settled'] = True
        
        # Save the updated user data
        user_model.save_user_data(user_id, user_data)
        
        return jsonify({'success': True, 'history_id': history_id})
    
    @dashboard_bp.route('/get_settlement_history')
    @login_required
    def get_settlement_history():
        user_id = session['user_id']
        game_id = request.args.get('game_id')  # Optional: filter by game
        
        # Load user data
        user_data = user_model.load_user_data(user_id)
        
        # Get settlement history
        history = user_data.get('settlement_history', [])
        
        # Filter by game_id if provided
        if game_id:
            history = [entry for entry in history if entry.get('game_id') == game_id]
        
        # Sort by date (newest first)
        history.sort(key=lambda x: x.get('date', ''), reverse=True)
        
        return jsonify({'success': True, 'history': history})
    
    @dashboard_bp.route('/export_game_settlement')
    @login_required
    def export_game_settlement():
        from flask import send_file, render_template
        from io import BytesIO
        import base64
        
        user_id = session['user_id']
        game_id = request.args.get('game_id')
        history_id = request.args.get('history_id')  
        
        if not game_id or not history_id:
            return jsonify({'success': False, 'error': 'Missing game_id or history_id'})
        
        # Load user data
        user_data = user_model.load_user_data(user_id)
        
        # Find the specific settlement history entry
        history_entry = next((entry for entry in user_data.get('settlement_history', []) 
                             if entry.get('id') == history_id), None)
        
        if not history_entry:
            return jsonify({'success': False, 'error': 'Settlement history not found'})
        
        # Return the settlement data as JSON instead of HTML
        # This will be used by the frontend to generate an image matching the in-game view
        return jsonify({
            'success': True,
            'settlement_data': history_entry.get('settlement_data', {}),
            'game_name': history_entry.get('game_name', 'Game'),
            'date': history_entry.get('date', '')
        })
    

        
    @dashboard_bp.route('/clear_game_scores', methods=['POST'])
    @login_required
    def clear_game_scores():
        user_id = session['user_id']
        game_id = request.json.get('game_id')
        
        if not game_id:
            return jsonify({'success': False, 'error': 'Game ID required'})
        
        # Load user data
        user_data = user_model.load_user_data(user_id)
        
        # Find the game
        game = next((g for g in user_data['games'] if g['game_id'] == game_id), None)
        if not game:
            return jsonify({'success': False, 'error': 'Game not found'})
        
        # Reset scores for all players
        for player in game['players']:
            player['final_amount'] = 0
            player['is_settled'] = False
        
        # Clear settlement data if exists
        if 'settlement' in game:
            del game['settlement']
        
        # Save the updated user data
        user_model.save_user_data(user_id, user_data)
        
        return jsonify({'success': True})
        
    return dashboard_bp
