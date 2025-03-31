// Settlement Display Fix - Overrides any other script that might be controlling settlement visibility
(function() {
    console.log('💪 Loading settlement display fix script (override version)');
    
    // Wait for document to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🔍 Settlement display fix initialized');
        
        // Make sure settlement results are ALWAYS hidden on page load
        hideSettlementResults();
        
        // Find the calculate settlement button
        const settleBtn = document.getElementById('calculate-settlement');
        if (settleBtn) {
            // Remove all existing event listeners and add our own
            const newButton = settleBtn.cloneNode(true);
            settleBtn.parentNode.replaceChild(newButton, settleBtn);
            
            // Add our clean event listener
            newButton.addEventListener('click', function(e) {
                // Prevent any other handlers from executing
                e.stopImmediatePropagation();
                
                console.log('🧮 Calculate settlement button clicked');
                this.innerHTML = '<i class="bi bi-hourglass-split"></i> Calculating...';
                
                // Check if net balance is zero
                if (!isNetBalanceZero()) {
                    alert('Net profit/losses must be zero before calculating settlement. Please check player amounts to make sure the total profit equals the total losses.');
                    this.innerHTML = '<i class="bi bi-calculator"></i> Calculate Settlement';
                    return;
                }
                
                calculateSettlement()
                    .then(result => {
                        console.log('✅ Settlement calculation successful');
                        
                        // First hide any existing results
                        hideSettlementResults();
                        
                        // Then populate and show the results
                        populateSettlementResults(result);
                        showSettlementResults();
                        
                        // Scroll to the results
                        scrollToSettlementResults();
                    })
                    .catch(err => {
                        console.error('❌ Settlement calculation failed:', err);
                        alert('Error calculating settlement. Please try again.');
                    })
                    .finally(() => {
                        this.innerHTML = '<i class="bi bi-calculator"></i> Calculate Settlement';
                    });
            });
            
            console.log('🔄 Calculate settlement button handler replaced successfully');
        } else {
            console.warn('⚠️ Calculate settlement button not found');
        }
    });
    
    // Try to detect if we're navigating back to a page with settlement results
    window.addEventListener('pageshow', function(event) {
        // This will fire when the page is shown, including when navigating back
        console.log('📄 Page shown event fired');
        
        // Make sure settlement results are hidden
        setTimeout(hideSettlementResults, 100);
    });
    
    // Function to hide settlement results
    function hideSettlementResults() {
        const results = document.getElementById('settlementResults');
        if (results) {
            console.log('🙈 Hiding settlement results');
            
            // Force inline style to override any CSS !important rules
            results.style.cssText = 'display: none !important; visibility: hidden !important;';
            results.setAttribute('data-status', 'hidden');
            
            return true;
        }
        return false;
    }
    
    // Function to show settlement results
    function showSettlementResults() {
        const results = document.getElementById('settlementResults');
        if (results) {
            console.log('👁 Showing settlement results');
            
            // Show the results section
            results.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important;';
            results.setAttribute('data-status', 'visible');
            
            return true;
        }
        return false;
    }
    
    // Function to scroll to settlement results
    function scrollToSettlementResults() {
        const results = document.getElementById('settlementResults');
        if (results) {
            console.log('⬇️ Scrolling to settlement results');
            
            // Scroll to the results
            setTimeout(function() {
                window.scrollTo({
                    top: results.offsetTop - 20,
                    behavior: 'smooth'
                });
            }, 300);
            
            return true;
        }
        return false;
    }
    
    // Function to populate settlement results
    function populateSettlementResults(result) {
        console.log('📝 Populating settlement results');
        
        // 1. Format date
        const now = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Update date display if element exists
        const settlementDateEl = document.getElementById('settlementDate');
        if (settlementDateEl) {
            settlementDateEl.textContent = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
        }
        
        // 2. Populate player results table
        const playerResultsEl = document.getElementById('playerResults');
        if (playerResultsEl) {
            let playerResultsHtml = '';
            (result.player_results || []).forEach(player => {
                const buyIn = parseFloat(player.buy_in).toFixed(2);
                const finalAmount = parseFloat(player.final_amount).toFixed(2);
                const profitLoss = Math.abs(player.profit_loss).toFixed(2);
                
                playerResultsHtml += `
                    <tr>
                        <td>${player.name}</td>
                        <td>${player.group !== 'Ungrouped' ? player.group : ''}</td>
                        <td>$${buyIn}</td>
                        <td>$${finalAmount}</td>
                        <td class="${player.profit_loss >= 0 ? 'profit' : 'loss'}">
                            ${player.profit_loss >= 0 ? '+' : '-'}$${profitLoss}
                        </td>
                    </tr>
                `;
            });
            playerResultsEl.innerHTML = playerResultsHtml;
        }
        
        // 3. Populate group results table
        const groupResultsEl = document.getElementById('groupResults');
        if (groupResultsEl) {
            let groupResultsHtml = '';
            if (result.group_summary && result.group_summary.length > 0) {
                result.group_summary.forEach(group => {
                    const initial = parseFloat(group.initial).toFixed(2);
                    const final = parseFloat(group.final).toFixed(2);
                    const settlement = parseFloat(group.settlement || 0).toFixed(2);
                    
                    groupResultsHtml += `
                        <tr>
                            <td>${group.name !== 'Ungrouped' ? group.name : 'No Group'}</td>
                            <td>$${initial}</td>
                            <td>$${final}</td>
                            <td class="${group.settlement >= 0 ? 'profit' : 'loss'}">
                                ${Math.abs(parseFloat(settlement)) > 0.01 ? (group.settlement >= 0 ? '+' : '-') + '$' + Math.abs(settlement) : '-'}
                            </td>
                        </tr>
                    `;
                });
            }
            groupResultsEl.innerHTML = groupResultsHtml;
        }
        
        // 4. Populate payment results table
        const paymentResultsEl = document.getElementById('paymentResults');
        if (paymentResultsEl) {
            let paymentResultsHtml = '';
            const groupPayments = (result.group_settlements || []);
            const internalPayments = (result.internal_settlements || []);
            
            // First, display group settlements
            groupPayments.forEach(payment => {
                const amount = parseFloat(payment.amount).toFixed(2);
                
                paymentResultsHtml += `
                    <tr>
                        <td><span class="badge bg-primary">Group</span></td>
                        <td>${payment.from}</td>
                        <td>${payment.to}</td>
                        <td class="amount">$${amount}</td>
                        <td class="text-muted small">${payment.note || ''}</td>
                    </tr>
                `;
            });
            
            // Then, display internal settlements
            internalPayments.forEach(payment => {
                const amount = parseFloat(payment.amount).toFixed(2);
                
                paymentResultsHtml += `
                    <tr>
                        <td><span class="badge bg-secondary">Internal</span></td>
                        <td>${payment.from}</td>
                        <td>${payment.to}</td>
                        <td class="amount">$${amount}</td>
                        <td class="text-muted small">${payment.note || ''}</td>
                    </tr>
                `;
            });
            paymentResultsEl.innerHTML = paymentResultsHtml;
        }
    }
    
    // Calculate settlement (copied from game.js)
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
    
    // Helper function (copied from game.js)
    function areAllInputsFilled() {
        return Array.from(document.querySelectorAll('.buy-in-value, .final-amount'))
            .every(input => input.value.trim() !== '');
    }
    
    // Check if net balance is zero (copied from game.js)
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
        
        // Return true if total is close to zero (allowing for floating point errors)
        return Math.abs(totalProfit) < 0.01;
    }
})();
