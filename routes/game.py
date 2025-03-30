from flask import Blueprint, render_template, request, redirect, url_for, session, jsonify, flash
from routes.dashboard import login_required

game_bp = Blueprint('game', __name__)

def init_routes(user_model, game_model, settlement_model):
    """
    Initialize game routes with model dependencies.
    """
    @game_bp.route('/game/<game_id>')
    @login_required
    def view(game_id):
        user_id = session['user_id']
        game = game_model.get_game(user_id, game_id)
        
        if not game:
            return redirect(url_for('dashboard.index'))
        
        return render_template('game.html', game=game, user_id=user_id)

    @game_bp.route('/add_player', methods=['POST'])
    @login_required
    def add_player():
        user_id = session['user_id']
        game_id = request.form.get('game_id')
        player_name = request.form.get('player_name')
        group_name = request.form.get('group_name')
        
        if not player_name or not game_id:
            flash('Player name is required')
            return redirect(url_for('game.view', game_id=game_id))
        
        success = game_model.add_player(user_id, game_id, player_name, group_name)
        
        if success:
            flash(f'Added player: {player_name}')
        else:
            flash('Error adding player')
            
        return redirect(url_for('game.view', game_id=game_id))

    @game_bp.route('/add_group', methods=['POST'])
    @login_required
    def add_group():
        user_id = session['user_id']
        game_id = request.form.get('game_id')
        group_name = request.form.get('group_name')
        
        if not group_name or not game_id:
            flash('Group name is required')
            return redirect(url_for('game.view', game_id=game_id))
        
        success = game_model.add_group(user_id, game_id, group_name)
        
        if success:
            flash(f'Added group: {group_name}')
        else:
            flash('Error adding group')
            
        return redirect(url_for('game.view', game_id=game_id))

    @game_bp.route('/update_player', methods=['POST'])
    @login_required
    def update_player():
        user_id = session['user_id']
        game_id = request.form.get('game_id')
        player_name = request.form.get('player_name')
        group_name = request.form.get('group_name')
        buy_in = request.form.get('buy_in', type=float)
        final_amount = request.form.get('final_amount', type=float)
        
        success = game_model.update_player(
            user_id, 
            game_id, 
            player_name, 
            group_name=group_name, 
            buy_in=buy_in, 
            final_amount=final_amount
        )
        
        if not success:
            return jsonify({'success': False, 'error': 'Player not found'})
        
        return jsonify({'success': True})

    @game_bp.route('/remove_player', methods=['POST'])
    @login_required
    def remove_player():
        user_id = session['user_id']
        game_id = request.form.get('game_id')
        player_name = request.form.get('player_name')
        
        if not player_name or not game_id:
            return jsonify({'success': False, 'error': 'Missing required fields'})
        
        success = game_model.remove_player(user_id, game_id, player_name)
        
        if success:
            flash(f'Removed player: {player_name}')
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'error': 'Failed to remove player'})

    @game_bp.route('/calculate_settlement')
    @login_required
    def calculate_settlement():
        user_id = session['user_id']
        game_id = request.args.get('game_id')
        
        result = settlement_model.calculate_settlement(user_id, game_id)
        return jsonify(result)

    return game_bp