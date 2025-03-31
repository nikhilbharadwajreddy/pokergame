from datetime import datetime
import uuid

class GameModel:
    def __init__(self, user_model=None):
        """
        Initialize the Game model with user model for data storage.
        """
        self.user_model = user_model
    
    def create_game(self, user_id, game_name=None):
        """
        Create a new game for a user. If a game with the same name exists, update it.
        """
        # Load user data
        user_data = self.user_model.load_user_data(user_id)
        
        # Generate default game name if not provided
        if not game_name:
            game_name = f"Game {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        
        # Check if a game with this name already exists
        existing_game = next((g for g in user_data.get('games', []) if g.get('game_name') == game_name), None)
        
        if existing_game:
            # Update the existing game's timestamp
            game_id = existing_game['game_id']
            existing_game['date_created'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            existing_game['last_updated'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            # We keep the existing players and groups
        else:
            # Generate unique ID for the new game
            game_id = str(uuid.uuid4())
            
            # Create new game object
            new_game = {
                'game_id': game_id,
                'game_name': game_name,
                'date_created': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'settlement_calculated_at': None,  # Track when settlement was calculated
                'players': [],
                'groups': [],
                'settlement_history': []
            }
            
            # Copy existing players and groups to the new game
            for player in user_data.get('players', []):
                new_game['players'].append({
                    'name': player['name'],
                    'group': None,
                    'buy_in': 10,
                    'final_amount': 0
                })
            
            for group in user_data.get('groups', []):
                new_game['groups'].append(group)
            
            # Add game to user's games list
            user_data['games'].append(new_game)
        
        # Save updated user data
        self.user_model.save_user_data(user_id, user_data)
        
        return game_id
    
    def get_game(self, user_id, game_id):
        """
        Get a specific game by ID.
        """
        user_data = self.user_model.load_user_data(user_id)
        
        # Find the game with the matching ID
        game = next((g for g in user_data['games'] if g['game_id'] == game_id), None)
        
        return game
    
    def add_player(self, user_id, game_id, player_name, group_name=None):
        """
        Add a player to a game.
        """
        if not player_name or not game_id:
            return False
            
        user_data = self.user_model.load_user_data(user_id)
        
        game = next((g for g in user_data['games'] if g['game_id'] == game_id), None)
        
        if not game:
            return False
        
        # Add to user's players if not already there
        if not any(p['name'] == player_name for p in user_data['players']):
            user_data['players'].append({'name': player_name})
        
        # Add to game players if not already there
        if not any(p['name'] == player_name for p in game['players']):
            game['players'].append({
                'name': player_name,
                'group': group_name,
                'buy_in': 10,
                'final_amount': 0
            })
        
        # Save updated user data
        self.user_model.save_user_data(user_id, user_data)
        
        return True
    
    def add_group(self, user_id, game_id, group_name):
        """
        Add a group to a game.
        """
        if not group_name or not game_id:
            return False
            
        user_data = self.user_model.load_user_data(user_id)
        
        game = next((g for g in user_data['games'] if g['game_id'] == game_id), None)
        
        if not game:
            return False
        
        # Add to user's groups if not already there
        if not any(g == group_name for g in user_data['groups']):
            user_data['groups'].append(group_name)
        
        # Add to game groups if not already there
        if not any(g == group_name for g in game['groups']):
            game['groups'].append(group_name)
        
        # Save updated user data
        self.user_model.save_user_data(user_id, user_data)
        
        return True
    
    def update_player(self, user_id, game_id, player_name, group_name=None, buy_in=None, final_amount=None):
        """
        Update a player's data in a game.
        """
        user_data = self.user_model.load_user_data(user_id)
        
        game = next((g for g in user_data['games'] if g['game_id'] == game_id), None)
        
        if not game:
            return False
        
        player = next((p for p in game['players'] if p['name'] == player_name), None)
        
        if not player:
            return False
        
        if group_name is not None:
            player['group'] = group_name
        
        if buy_in is not None:
            player['buy_in'] = buy_in
        
        if final_amount is not None:
            player['final_amount'] = final_amount
        
        # Save updated user data
        self.user_model.save_user_data(user_id, user_data)
        
        return True
    
    def remove_player(self, user_id, game_id, player_name):
        """
        Remove a player from a game.
        """
        if not player_name or not game_id:
            return False
            
        user_data = self.user_model.load_user_data(user_id)
        
        game = next((g for g in user_data['games'] if g['game_id'] == game_id), None)
        
        if not game:
            return False
        
        # Find and remove player from the game
        player_idx = next((i for i, p in enumerate(game['players']) if p['name'] == player_name), None)
        
        if player_idx is None:
            return False
            
        # Remove the player
        game['players'].pop(player_idx)
        
        # Save updated user data
        self.user_model.save_user_data(user_id, user_data)
        
        return True