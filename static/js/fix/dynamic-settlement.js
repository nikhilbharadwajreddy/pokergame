// Script to dynamically create and display settlement results
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dynamic settlement script loaded');
    
    // Find the calculate settlement button
    const settleBtn = document.getElementById('calculate-settlement');
    if (settleBtn) {
        // Override the click event to make sure our code runs
        const originalClickHandler = settleBtn.onclick;
        settleBtn.onclick = null;
        
        settleBtn.addEventListener('click', function(event) {
            console.log('Calculate settlement button clicked');
            
            // Check balance first
            if (!isNetBalanceZero()) {
                alert('Net profit/losses must be zero before calculating settlement. Please check player amounts to make sure the total profit equals the total losses.');
                return;
            }
            
            // Show loading state
            this.innerHTML = '<i class="bi bi-hourglass-split"></i> Calculating...';
            
            // Calculate settlement
            calculateSettlement()
                .then(result => {
                    console.log('Settlement calculation successful');
                    
                    // Create and show the settlement results
                    createSettlementResults(result);
                    
                    // Scroll to the results
                    const results = document.getElementById('settlementResults');
                    if (results) {
                        setTimeout(function() {
                            results.scrollIntoView({ behavior: 'smooth' });
                        }, 300);
                    }
                })
                .catch(err => {
                    console.error('Error calculating settlement:', err);
                    alert('Error calculating settlement. Please try again.');
                })
                .finally(() => {
                    this.innerHTML = '<i class="bi bi-calculator"></i> Calculate Settlement';
                });
        });
    }
    
    // Function to dynamically create the settlement results section
    function createSettlementResults(result) {
        // Format current date
        const now = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedDate = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
        
        // First remove any existing settlement results
        removeExistingSettlementResults();
        
        // Create HTML for settlement results
        const html = `
        <div class="row mt-4">
            <div class="col-12">
                <div id="settlementResults" class="settlement-section" style="margin-top: 60px;">
                    <div class="card">
                        <div class="d-flex justify-content-between align-items-center p-3">
                            <div>
                                <!-- Empty div for spacing -->
                            </div>
                            <div id="settlementDate" class="settlement-date">${formattedDate}</div>
                        </div>
                        <div class="card-body">
                            <div class="section-title-with-info">
                                <h5>Player Results</h5>
                                <i class="bi bi-info-circle info-icon" data-tooltip="Summary of each player's buy-in, final amount, and profit/loss."></i>
                            </div>
                            <div class="table-responsive mb-4">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Player</th>
                                            <th>Group</th>
                                            <th>Buy-in</th>
                                            <th>Final</th>
                                            <th>Profit/Loss</th>
                                        </tr>
                                    </thead>
                                    <tbody id="playerResults">
                                        ${generatePlayerResultsHtml(result.player_results || [])}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="section-title-with-info">
                                <h5>Group Summary</h5>
                                <i class="bi bi-info-circle info-icon" data-tooltip="Summary of each group's total buy-ins, final amounts, and overall settlement balance."></i>
                            </div>
                            <div class="table-responsive mb-4">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Group</th>
                                            <th>Initial</th>
                                            <th>Final</th>
                                            <th>Settlement</th>
                                        </tr>
                                    </thead>
                                    <tbody id="groupResults">
                                        ${generateGroupResultsHtml(result.group_summary || [])}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="section-title-with-info">
                                <h5>Payments</h5>
                                <i class="bi bi-info-circle info-icon" data-tooltip="List of payments needed to settle all debts with the minimum number of transactions."></i>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>From</th>
                                            <th>To</th>
                                            <th>Amount</th>
                                            <th>Note</th>
                                        </tr>
                                    </thead>
                                    <tbody id="paymentResults">
                                        ${generatePaymentResultsHtml(result.group_settlements || [], result.internal_settlements || [])}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="settlement-credit text-center mt-4">
                                Made with <i class="bi bi-heart-fill text-danger"></i> by Nikhil and Praneeth!
                                <div class="mt-2">
                                    <a href="https://buymeacoffee.com/nikhilreddy" target="_blank" style="color: #FFCC00; text-decoration: none; font-weight: bold;">
                                        <i class="bi bi-cup-hot"></i> Spend A Dollar on server, If you wanna make it work faster!
                                    </a>
                                </div>
                            </div>
                            <div class="text-end mt-3">
                                <div class="d-flex justify-content-end align-items-center">
                                    <button id="exportSettlement" class="btn btn-primary">
                                        <i class="bi bi-download"></i> Export
                                    </button>
                                    <span class="ms-2">
                                        <i class="bi bi-info-circle info-icon" data-tooltip="Export the settlement results as an image to share with players."></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
        
        // Add to the settlement container
        const container = document.getElementById('settlementContainer');
        if (container) {
            container.innerHTML = html;
            
            // Add export functionality
            const exportBtn = document.getElementById('exportSettlement');
            if (exportBtn) {
                exportBtn.addEventListener('click', exportSettlementAsImage);
            }
        }
    }
    
    // Generate HTML for player results
    function generatePlayerResultsHtml(playerResults) {
        let html = '';
        playerResults.forEach(player => {
            const buyIn = parseFloat(player.buy_in).toFixed(2);
            const finalAmount = parseFloat(player.final_amount).toFixed(2);
            const profitLoss = Math.abs(player.profit_loss).toFixed(2);
            
            html += `
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
        return html;
    }
    
    // Generate HTML for group results
    function generateGroupResultsHtml(groupSummary) {
        let html = '';
        groupSummary.forEach(group => {
            const initial = parseFloat(group.initial).toFixed(2);
            const final = parseFloat(group.final).toFixed(2);
            const settlement = parseFloat(group.settlement || 0).toFixed(2);
            
            html += `
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
        return html;
    }
    
    // Generate HTML for payment results
    function generatePaymentResultsHtml(groupPayments, internalPayments) {
        let html = '';
        
        // Group settlements
        groupPayments.forEach(payment => {
            const amount = parseFloat(payment.amount).toFixed(2);
            
            html += `
                <tr>
                    <td><span class="badge bg-primary">Group</span></td>
                    <td>${payment.from}</td>
                    <td>${payment.to}</td>
                    <td class="amount">$${amount}</td>
                    <td class="text-muted small">${payment.note || ''}</td>
                </tr>
            `;
        });
        
        // Internal settlements
        internalPayments.forEach(payment => {
            const amount = parseFloat(payment.amount).toFixed(2);
            
            html += `
                <tr>
                    <td><span class="badge bg-secondary">Internal</span></td>
                    <td>${payment.from}</td>
                    <td>${payment.to}</td>
                    <td class="amount">$${amount}</td>
                    <td class="text-muted small">${payment.note || ''}</td>
                </tr>
            `;
        });
        
        return html;
    }
    
    // Remove any existing settlement results
    function removeExistingSettlementResults() {
        const container = document.getElementById('settlementContainer');
        if (container) {
            container.innerHTML = '';
        }
        
        // Also remove any other settlement results that might exist
        const existingResults = document.getElementById('settlementResults');
        if (existingResults) {
            existingResults.remove();
        }
    }
    
    // Export settlement as image
    function exportSettlementAsImage() {
        // Elements to hide during export
        const elementsToHide = [
            document.getElementById('exportSettlement'),            // Export button
            document.querySelector('.settlement-credit .mt-2'),      // Donation link
            document.querySelector('.text-end.mt-3'),                // Export button container
            document.querySelector('.alert-info'),                   // Any blue notification bars
            document.querySelector('.alert-primary'),                // Any blue notification bars
            ...Array.from(document.querySelectorAll('.info-icon'))  // All tooltip icons
        ];
        
        // Store original display states
        const originalStates = [];
        
        // Hide elements
        elementsToHide.forEach(el => {
            if (el) {
                originalStates.push({ element: el, display: el.style.display });
                el.style.display = 'none';
            }
        });
        
        // Also hide all section titles
        const sectionTitles = document.querySelectorAll('.section-title-with-info');
        const originalTitleStates = [];
        
        sectionTitles.forEach(title => {
            // Store original padding and hide icons
            const icons = title.querySelectorAll('.info-icon');
            icons.forEach(icon => {
                originalTitleStates.push({ element: icon, display: icon.style.display });
                icon.style.display = 'none';
            });
        });
        
        html2canvas(document.getElementById('settlementResults'), { 
            backgroundColor: 'white',
            scale: 2
        }).then(canvas => {
            // Restore all elements
            originalStates.forEach(item => {
                item.element.style.display = item.display;
            });
            
            originalTitleStates.forEach(item => {
                item.element.style.display = item.display;
            });
            
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `poker-settlement-${new Date().toISOString().split('T')[0]}.png`;
            link.click();
        }).catch(error => {
            console.error('Error generating image:', error);
            
            // Make sure to restore elements in case of error
            originalStates.forEach(item => {
                item.element.style.display = item.display;
            });
            
            originalTitleStates.forEach(item => {
                item.element.style.display = item.display;
            });
        });
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
});
