from datetime import datetime

class SettlementModel:
    def __init__(self, user_model=None, game_model=None):
        """
        Initialize the Settlement model with user and game models.
        """
        self.user_model = user_model
        self.game_model = game_model
    
    def calculate_settlement(self, user_id, game_id):
        """
        Calculate settlement for a game using the following steps:
        1. Calculate group totals and individual player balances
        2. Perform group-level settlement first (net transfer between groups)
        3. Perform internal group settlement (transfers within each group)
        """
        # Load user data and get game
        game = self.game_model.get_game(user_id, game_id)
        
        if not game:
            return {'success': False, 'error': 'Game not found'}

        # STEP 1: Calculate group totals and individual player balances
        groups = {}
        player_data = {}
        player_results = []
        
        # Initialize player data
        for player in game['players']:
            name = player['name']
            group_name = player['group'] or 'Ungrouped'
            buy_in = float(player['buy_in'])
            final_amount = float(player['final_amount'])
            profit_loss = round(final_amount - buy_in, 2)
            
            # Add to player results list (will be returned to frontend)
            player_results.append({
                'name': name,
                'group': group_name,
                'buy_in': buy_in,
                'final_amount': final_amount,
                'profit_loss': profit_loss
            })
            
            # Initialize group if it doesn't exist
            if group_name not in groups:
                groups[group_name] = {
                    'name': group_name,
                    'initial': 0,
                    'final': 0,
                    'net': 0,
                    'players': []
                }
            
            # Store player data for settlement calculations
            player_data[name] = {
                'name': name,
                'group': group_name,
                'buy_in': buy_in,
                'final_amount': final_amount,
                'profit_loss': profit_loss,
                'remaining_balance': profit_loss  # Track how much needs to be settled
            }
            
            # Add player to their group
            groups[group_name]['players'].append(name)
            
            # Update group totals
            groups[group_name]['initial'] += buy_in
            groups[group_name]['final'] += final_amount
        
        # Calculate net for each group
        for group_name, group in groups.items():
            group['net'] = round(group['final'] - group['initial'], 2)
        
        # STEP 2: Perform Group Level Settlement first
        group_settlements = self._calculate_group_settlements(groups, player_data)
        
        # STEP 3: Handle internal group settlement
        internal_settlements = self._calculate_internal_settlements(groups, player_data)
        
        # Sort player results by profit_loss (highest first)
        player_results.sort(key=lambda p: p['profit_loss'], reverse=True)
        
        # Track group settlement amounts
        group_settlement_amounts = {group_name: 0 for group_name in groups.keys()}
        
        # Calculate group settlement amounts
        for settlement in group_settlements:
            from_player = settlement['from']
            to_player = settlement['to']
            amount = float(settlement['amount'])
            
            # Find the groups for the players
            from_group = player_data[from_player]['group']
            to_group = player_data[to_player]['group']
            
            # Update group settlement amounts
            group_settlement_amounts[from_group] -= amount
            group_settlement_amounts[to_group] += amount
        
        # Combine all results
        result = {
            'player_results': player_results,
            'group_settlements': group_settlements,
            'internal_settlements': internal_settlements,
            'group_summary': [
                {
                    'name': group_name,
                    'initial': group['initial'],
                    'final': group['final'],
                    'net': group['net'],
                    'settlement': group_settlement_amounts.get(group_name, 0)
                } for group_name, group in groups.items()
            ]
        }
        
        # Save the settlement results to the game
        user_data = self.user_model.load_user_data(user_id)
        game_obj = next((g for g in user_data['games'] if g['game_id'] == game_id), None)
        if game_obj:
            game_obj['settlement'] = result
            game_obj['settlement_calculated_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            self.user_model.save_user_data(user_id, user_data)
        
        return {'success': True, 'result': result}
    
    def _calculate_group_settlements(self, groups, player_data):
        """
        Calculate settlements between groups using representatives.
        The biggest loser in a negative group will pay to the biggest winners in positive groups.
        """
        group_settlements = []
        
        # Identify groups with positive and negative balances
        positive_groups = []
        negative_groups = []
        
        for name, group in groups.items():
            if group['net'] > 0.01:  # Positive group
                positive_groups.append((name, group))
            elif group['net'] < -0.01:  # Negative group
                negative_groups.append((name, group))
        
        # Sort groups by net value (highest positive first, lowest negative first)
        positive_groups.sort(key=lambda x: x[1]['net'], reverse=True)
        negative_groups.sort(key=lambda x: x[1]['net'])
        
        # For each negative group, pay positive groups
        for neg_name, neg_group in negative_groups:
            neg_amount = abs(neg_group['net'])
            
            # Skip if effectively zero
            if neg_amount < 0.01:
                continue
            
            # Find the player with the biggest loss in this group to be the representative
            biggest_loser = None
            biggest_loss = 0
            
            for player_name in neg_group['players']:
                player_profit_loss = player_data[player_name]['profit_loss']
                if player_profit_loss < 0 and abs(player_profit_loss) > biggest_loss:
                    biggest_loser = player_name
                    biggest_loss = abs(player_profit_loss)
            
            # If no losing player found (unusual), skip this group
            if not biggest_loser:
                continue
                
            # For each positive group, receive payment
            for pos_name, pos_group in positive_groups:
                pos_amount = pos_group['net']
                
                # Skip if effectively zero
                if pos_amount < 0.01:
                    continue
                
                # Find the player with the biggest profit in this group as representative
                biggest_winner = None
                biggest_profit = 0
                
                for player_name in pos_group['players']:
                    player_profit_loss = player_data[player_name]['profit_loss']
                    if player_profit_loss > 0 and player_profit_loss > biggest_profit:
                        biggest_winner = player_name
                        biggest_profit = player_profit_loss
                
                # If no winning player found (unusual), skip this group
                if not biggest_winner:
                    continue
                
                # Calculate payment amount
                payment = min(neg_amount, pos_amount)
                if payment < 0.01:
                    continue
                
                # Create settlement record
                group_settlements.append({
                    'from': biggest_loser,
                    'to': biggest_winner,
                    'amount': round(payment, 2),
                    'note': f"Group: {neg_name} → {pos_name}"
                })
                
                # Update remaining amounts
                neg_amount = round(neg_amount - payment, 2)
                pos_amount = round(pos_amount - payment, 2)
                
                # Update group balances for next iteration
                neg_group['net'] = round(neg_group['net'] + payment, 2)
                pos_group['net'] = round(pos_group['net'] - payment, 2)
                
                # If this positive group has received all it needs, move to next group
                if pos_amount < 0.01:
                    continue
                    
                # If negative group has paid all it owes, move to next negative group
                if neg_amount < 0.01:
                    break
        
        return group_settlements
    
    def _calculate_internal_settlements(self, groups, player_data):
        """
        Calculate settlements within groups:
        1. Losers in a group pay winners directly
        2. The biggest winner in a winning group pays to other winners proportionally
        """
        internal_settlements = []
        
        for group_name, group in groups.items():
            # Skip empty groups or groups with only one player
            if not group['players'] or len(group['players']) <= 1:
                continue
                
            # Identify positive and negative players within this group
            winning_players = []
            losing_players = []
            
            for player_name in group['players']:
                profit_loss = player_data[player_name]['profit_loss']
                
                if profit_loss > 0.01:  # Player has positive balance
                    winning_players.append((player_name, profit_loss))
                elif profit_loss < -0.01:  # Player has negative balance
                    losing_players.append((player_name, abs(profit_loss)))
            
            # If this group has both winners and losers, handle settlements within group
            if winning_players and losing_players:
                # Sort winners by profit amount (highest first)
                winning_players.sort(key=lambda x: x[1], reverse=True)
                # Sort losers by loss amount (highest first)
                losing_players.sort(key=lambda x: x[1], reverse=True)
                
                # Distribute payments from losers to winners
                remaining_losses = {name: amount for name, amount in losing_players}
                remaining_profits = {name: amount for name, amount in winning_players}
                
                for loser_name, loss_amount in losing_players:
                    remaining_loss = remaining_losses[loser_name]
                    if remaining_loss < 0.01:
                        continue
                        
                    for winner_name, profit_amount in winning_players:
                        remaining_profit = remaining_profits[winner_name]
                        if remaining_profit < 0.01:
                            continue
                            
                        # Calculate payment amount
                        payment = min(remaining_loss, remaining_profit)
                        if payment < 0.01:
                            continue
                            
                        internal_settlements.append({
                            'from': loser_name,
                            'to': winner_name,
                            'amount': round(payment, 2),
                            'note': f"Internal: Group {group_name}"
                        })
                        
                        # Update remaining amounts
                        remaining_losses[loser_name] = round(remaining_loss - payment, 2)
                        remaining_profits[winner_name] = round(remaining_profit - payment, 2)
                        
                        if remaining_losses[loser_name] < 0.01:
                            break
            
            # If this group has multiple winners only (typical in a winning group), distribute winnings
            elif len(winning_players) > 1:
                # Sort winners by profit amount (highest first)
                winning_players.sort(key=lambda x: x[1], reverse=True)
                
                # The biggest winner (who received external payments)
                biggest_winner, biggest_profit = winning_players[0]
                
                # Other winners should receive their share from the biggest winner
                for winner_name, profit_amount in winning_players[1:]:  # Skip the biggest winner
                    if profit_amount < 0.01:
                        continue
                    
                    # Calculate payment proportionally
                    payment = round(profit_amount, 2)
                    
                    internal_settlements.append({
                        'from': biggest_winner,
                        'to': winner_name,
                        'amount': payment,
                        'note': f"Internal: Group {group_name} (winner distribution)"
                    })
        
        return internal_settlements