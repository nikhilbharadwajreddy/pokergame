// Check if net profit/losses is zero
function isNetBalanceZero() {
    let totalProfit = 0;
    
    // Get all player rows
    document.querySelectorAll('.buy-in-value').forEach(input => {
        const player = input.getAttribute('data-player');
        const buyIn = parseFloat(input.value) || 0;
        const finalEl = document.querySelector(`.final-amount[data-player="${player}"]`);
        const finalAmount = parseFloat(finalEl?.value) || 0;
        
        // Calculate profit/loss
        const profitLoss = finalAmount - buyIn;
        totalProfit += profitLoss;
    });
    
    // Update the net balance display if it exists
    const netBalanceInfo = document.getElementById('net-balance-info');
    if (netBalanceInfo) {
        // Format to 2 decimal places
        netBalanceInfo.textContent = `Net Balance: $${Math.abs(totalProfit).toFixed(2)}`;
        
        // Update status color
        if (Math.abs(totalProfit) < 0.01) {
            netBalanceInfo.classList.remove('bg-danger');
            netBalanceInfo.classList.add('bg-success');
        } else {
            netBalanceInfo.classList.remove('bg-success'); 
            netBalanceInfo.classList.add('bg-danger');
        }
    }
    
    // Return true if total is close to zero (allowing for floating point errors)
    return Math.abs(totalProfit) < 0.01;
}

// Check net balance and update settlement button state
function checkNetBalanceForSettleButton() {
    const settleBtn = document.getElementById('calculate-settlement');
    if (!settleBtn) return;
    
    // Check if all inputs are filled first
    const allFilled = areAllInputsFilled();
    
    // If all filled, check net balance
    if (allFilled) {
        const isZero = isNetBalanceZero();
        
        // Add tooltip explaining why net should be zero
        if (!isZero) {
            settleBtn.setAttribute('title', 'Net profit/losses must be zero before settlement - make sure total profits equal total losses');
            settleBtn.classList.add('btn-secondary');
            settleBtn.classList.remove('btn-success');
        } else {
            settleBtn.removeAttribute('title');
            settleBtn.classList.add('btn-success');
            settleBtn.classList.remove('btn-secondary');
        }
    } else {
        // Don't disable the button, just change its appearance
        settleBtn.setAttribute('title', 'Fill in all player values first');
        settleBtn.classList.add('btn-secondary');
        settleBtn.classList.remove('btn-success');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // First, check if game should be in view-only mode
    checkGameStatus();
    
    // Make sure settlement results are hidden by default
    const resultsSection = document.getElementById('settlementResults');
    if (resultsSection) {
        resultsSection.style.display = 'none';
    }
    // Set up player updates
    setupPlayerUpdates();
    
    // Set up settlement button
    const settleBtn = document.getElementById('calculate-settlement');
    if (settleBtn) {
        settleBtn.addEventListener('click', function() {
            // Check if net balance is zero
            if (!isNetBalanceZero()) {
                alert('Net profit/losses must be zero before calculating settlement. Please check player amounts to make sure the total profit equals the total losses.');
                return;
            }
            
            // We now always let the button be clickable, but
            // we still warn when net isn't zero
            this.innerHTML = '<i class="bi bi-hourglass-split"></i> Calculating...';
            
            // Set flag that we're starting to calculate settlement
            const settlementResults = document.getElementById('settlementResults');
            if (settlementResults) {
                settlementResults.removeAttribute('data-status');
            }
            
            calculateSettlement()
                .then(result => {
                    console.log('Settlement calculation successful, attempting to display');
                    
                    // First try our direct display method
                    if (typeof directDisplaySettlement === 'function') {
                        console.log('Using direct display method');
                        directDisplaySettlement(result);
                    } else {
                        // Fall back to the original display method
                        console.log('Direct display not available, using original method');
                        if (typeof displaySettlement === 'function') {
                            displaySettlement(result);
                        } else {
                            console.error('No display methods found!');
                        }
                    }
                })
                .finally(() => {
                    // Re-enable the button
                    this.innerHTML = '<i class="bi bi-calculator"></i> Calculate Settlement';
                    
                    // Double check that settlement results are visible
                    setTimeout(() => {
                        const results = document.getElementById('settlementResults');
                        if (results) {
                            // Force display again after a delay
                            results.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important;';
                            // Scroll to it to make sure it's visible
                            results.scrollIntoView({ behavior: 'smooth' });
                        }
                    }, 500);
                    
                    // Only check game status without forcing refresh
                    setTimeout(() => {
                        checkGameStatus(false);
                    }, 3000);
                });
        });
        
        // Check if net balance is zero whenever inputs change
        checkNetBalanceForSettleButton();
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
            // Check net balance after update
            checkNetBalanceForSettleButton();
        });
    });
    
    document.querySelectorAll('.increase-buy-in').forEach(btn => {
        btn.addEventListener('click', function() {
            const player = this.getAttribute('data-player');
            const input = document.querySelector(`.buy-in-value[data-player="${player}"]`);
            input.value = (parseFloat(input.value) || 0) + 1;
            updatePlayer(player, { buy_in: input.value });
            // Check net balance after update
            checkNetBalanceForSettleButton();
        });
    });
    
    // Direct input changes
    document.querySelectorAll('.buy-in-value').forEach(input => {
        input.addEventListener('change', function() {
            updatePlayer(this.getAttribute('data-player'), {
                buy_in: parseFloat(this.value) || 0
            });
            // Check net balance after update
            checkNetBalanceForSettleButton();
        });
    });
    
    // Final amount changes
    document.querySelectorAll('.final-amount').forEach(input => {
        input.addEventListener('change', function() {
            const player = this.getAttribute('data-player');
            const value = parseFloat(this.value) || 0;
            
            updatePlayer(player, { final_amount: value });

            // Check net balance after update
            checkNetBalanceForSettleButton();

            // Auto-calculate when all inputs are filled
            setTimeout(() => {
                if (areAllInputsFilled()) {
                    // Add check to ensure net balance is zero
                    if (!isNetBalanceZero()) {
                        console.log('Auto-calculate skipped: Net balance is not zero');
                        
                        // Show a notification that balances need to be fixed
                        const netBalanceInfo = document.getElementById('net-balance-info');
                        if (netBalanceInfo) {
                            netBalanceInfo.classList.add('flash-warning');
                            setTimeout(() => {
                                netBalanceInfo.classList.remove('flash-warning');
                            }, 1500);
                        }
                        
                        return; // Skip settlement calculation if net isn't zero
                    }
                    
                    calculateSettlement()
                        .then(result => {
                            // Use the direct display method
                            if (typeof directDisplaySettlement === 'function') {
                                directDisplaySettlement(result);
                            } else if (typeof displaySettlement === 'function') {
                                displaySettlement(result);
                            }
                        })
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