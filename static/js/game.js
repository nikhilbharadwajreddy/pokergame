document.addEventListener('DOMContentLoaded', function() {
    // First, check if game should be in view-only mode
    checkGameStatus();
    
    // Set up player updates
    setupPlayerUpdates();
    
    // Set up settlement button
    const settleBtn = document.getElementById('calculate-settlement');
    if (settleBtn) {
        settleBtn.addEventListener('click', function() {
            this.disabled = true;
            this.innerHTML = '<i class="bi bi-hourglass-split"></i> Calculating...';
            
            calculateSettlement()
                .then(displaySettlement)
                .finally(() => {
                    this.disabled = false;
                    this.innerHTML = '<i class="bi bi-calculator"></i> Calculate Settlement';
                    // Only check game status without forcing refresh
                    setTimeout(() => {
                        checkGameStatus(false);
                    }, 3000);
                });
        });
    }
    
    // Set up player removal
    document.querySelectorAll('.remove-player').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const playerName = this.getAttribute('data-player');
            if (confirm(`Remove ${playerName}?`)) removePlayer(playerName);
        });
    });
});

// Check if game should be in view-only mode
function checkGameStatus(forceRefresh = false) {
    const gameId = document.querySelector('input[name="game_id"]').value;
    
    fetch(`/check_game_status?game_id=${gameId}`)
        .then(response => response.json())
        .then(data => {
            if (data.view_only) {
                // If game should be view-only, disable all inputs and buttons
                makeGameViewOnly();
            } else if (forceRefresh) {
                // Refresh the page if we just calculated a settlement
                window.location.reload();
            }
        })
        .catch(error => console.error('Error checking game status:', error));
}

// Make game view-only by disabling all inputs and buttons
function makeGameViewOnly() {
    // Disable all inputs
    document.querySelectorAll('input, select, button').forEach(element => {
        element.disabled = true;
    });
    
    // Add view-only notice
    const gameForm = document.querySelector('.game-form');
    if (gameForm) {
        const viewOnlyNotice = document.createElement('div');
        viewOnlyNotice.className = 'alert alert-info';
        viewOnlyNotice.innerHTML = '<i class="bi bi-info-circle"></i> This game is in view-only mode. Settlements have been calculated.';
        gameForm.prepend(viewOnlyNotice);
    }
}

// Handle all player updates
function setupPlayerUpdates() {
    // Group selection
    document.querySelectorAll('.group-select').forEach(select => {
        select.addEventListener('change', function() {
            updatePlayer(this.getAttribute('data-player'), {
                group_name: this.value
            });
        });
    });
    
    // Buy-in adjustments
    document.querySelectorAll('.decrease-buy-in').forEach(btn => {
        btn.addEventListener('click', function() {
            const player = this.getAttribute('data-player');
            const input = document.querySelector(`.buy-in-value[data-player="${player}"]`);
            input.value = Math.max(0, (parseFloat(input.value) || 0) - 1);
            updatePlayer(player, { buy_in: input.value });
        });
    });
    
    document.querySelectorAll('.increase-buy-in').forEach(btn => {
        btn.addEventListener('click', function() {
            const player = this.getAttribute('data-player');
            const input = document.querySelector(`.buy-in-value[data-player="${player}"]`);
            input.value = (parseFloat(input.value) || 0) + 1;
            updatePlayer(player, { buy_in: input.value });
        });
    });
    
    // Direct input changes
    document.querySelectorAll('.buy-in-value').forEach(input => {
        input.addEventListener('change', function() {
            updatePlayer(this.getAttribute('data-player'), {
                buy_in: parseFloat(this.value) || 0
            });
        });
    });
    
    // Final amount changes
    document.querySelectorAll('.final-amount').forEach(input => {
        input.addEventListener('change', function() {
            const player = this.getAttribute('data-player');
            const value = parseFloat(this.value) || 0;
            
            updatePlayer(player, { final_amount: value });

            // Auto-calculate when all inputs are filled
            setTimeout(() => {
                if (areAllInputsFilled()) {
                    calculateSettlement()
                        .then(displaySettlement)
                        .catch(e => console.error(e));
                }
            }, 300);
        });
    });
}

// Check if all inputs are filled
function areAllInputsFilled() {
    return Array.from(document.querySelectorAll('.buy-in-value, .final-amount'))
        .every(input => input.value.trim() !== '');
}

// Update player data on server
function updatePlayer(player, data) {
    const gameId = document.querySelector('input[name="game_id"]').value;
    const formData = new FormData();
    
    formData.append('game_id', gameId);
    formData.append('player_name', player);
    
    if (data.group_name !== undefined) formData.append('group_name', data.group_name);
    if (data.buy_in !== undefined) formData.append('buy_in', data.buy_in);
    if (data.final_amount !== undefined) formData.append('final_amount', data.final_amount);
    
    fetch('/update_player', {
        method: 'POST',
        body: formData
    }).catch(e => console.error(e));
}

// Remove player
function removePlayer(player) {
    const gameId = document.querySelector('input[name="game_id"]').value;
    const formData = new FormData();
    
    formData.append('game_id', gameId);
    formData.append('player_name', player);
    
    fetch('/remove_player', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) window.location.reload();
    });
}

// Calculate settlement
function calculateSettlement() {
    const gameId = document.querySelector('input[name="game_id"]').value;
    
    return new Promise((resolve, reject) => {
        if (!areAllInputsFilled()) {
            reject(new Error('Fill all values'));
            return;
        }
        
        fetch(`/calculate_settlement?game_id=${gameId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) resolve(data.result);
                else reject(new Error(data.error || 'Error'));
            })
            .catch(reject);
    });
}