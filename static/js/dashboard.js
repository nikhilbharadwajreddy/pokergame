document.addEventListener('DOMContentLoaded', function() {
    // Fetch settlement history
    fetchSettlementHistory();
    
    // Add event listener for game filter
    document.getElementById('gameFilter').addEventListener('change', function() {
        const gameId = this.value;
        if (gameId === 'all') {
            fetchSettlementHistory();
        } else {
            fetchSettlementHistory(gameId);
        }
    });
    
    // Add event handler for export buttons
    document.addEventListener('click', function(event) {
        if (event.target.closest('.export-game')) {
            const button = event.target.closest('.export-game');
            const gameId = button.getAttribute('data-game-id');
            const historyId = button.getAttribute('data-history-id');
            exportGame(gameId, historyId);
        }
    });
    
    // Function to export a game settlement
    function exportGame(gameId, historyId) {
        // Call the exportGameSettlement function from export.js
        exportGameSettlement(gameId, historyId);
    }
    
    // Function to fetch settlement history
    function fetchSettlementHistory(gameId = null) {
        let url = '/get_settlement_history';
        if (gameId) {
            url += `?game_id=${gameId}`;
        }
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displaySettlementHistory(data.history);
                } else {
                    document.getElementById('settlementHistory').innerHTML = 
                        '<div class="alert alert-danger">Error loading settlement history</div>';
                }
            })
            .catch(error => {
                console.error('Error fetching settlement history:', error);
                document.getElementById('settlementHistory').innerHTML = 
                    '<div class="alert alert-danger">Error loading settlement history</div>';
            });
    }
    
    // Function to display settlement history
    function displaySettlementHistory(history) {
        const historyContainer = document.getElementById('settlementHistory');
        
        if (!history || history.length === 0) {
            historyContainer.innerHTML = '<div class="alert alert-info">No settlement history found.</div>';
            document.getElementById('historyCount').textContent = '0';
            return;
        }
        
        // Update history count badge
        document.getElementById('historyCount').textContent = history.length;
        
        let historyHtml = '';
        
        history.forEach(entry => {
            const date = new Date(entry.date);
            const formattedDate = date.toLocaleString();
            
            const settlementData = entry.settlement_data;
            
            // Create history item
            historyHtml += `
                <div class="history-item" data-history-id="${entry.id}">
                    <div class="history-header">
                        <div>
                            <h5>${entry.game_name}</h5>
                            <div class="history-date">${formattedDate}</div>
                        </div>
                        <div class="history-actions">
                            <button class="btn btn-sm btn-outline-primary export-game" data-game-id="${entry.game_id}" data-history-id="${entry.id}">
                                <i class="bi bi-download"></i> Export
                            </button>
                            <button class="history-toggle btn btn-sm btn-outline-secondary" onclick="toggleSettlementDetails('${entry.id}')">
                                Show Details
                            </button>
                        </div>
                    </div>
                    <div class="settlement-details" id="details-${entry.id}" style="display: none;">
                        <div class="row">
                            <div class="col-12">
                                <h6>Player Results</h6>
                                <div class="table-responsive">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Player</th>
                                                <th>Group</th>
                                                <th>Buy-In</th>
                                                <th>Final</th>
                                                <th>P/L</th>
                                            </tr>
                                        </thead>
                                        <tbody>
            `;
            
            // Add player results
            (settlementData.player_results || []).forEach(player => {
                const buyIn = parseFloat(player.buy_in).toFixed(2);
                const finalAmount = parseFloat(player.final_amount).toFixed(2);
                const profitLoss = Math.abs(player.profit_loss).toFixed(2);
                
                historyHtml += `
                    <tr>
                        <td>${player.name}</td>
                        <td>${player.group !== 'Ungrouped' ? player.group : ''}</td>
                        <td>$${buyIn}</td>
                        <td>$${finalAmount}</td>
                        <td class="${player.profit_loss >= 0 ? 'text-success' : 'text-danger'}">
                            ${player.profit_loss >= 0 ? '+' : '-'}$${profitLoss}
                        </td>
                    </tr>
                `;
            });
            
            // Close player results table and add payments section
            historyHtml += `
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row mt-3">
                            <div class="col-12">
                                <h6>Payments</h6>
                                <div class="table-responsive">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Type</th>
                                                <th>From</th>
                                                <th>To</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
            `;
            
            // Add group settlements
            (settlementData.group_settlements || []).forEach(payment => {
                const amount = parseFloat(payment.amount).toFixed(2);
                
                historyHtml += `
                    <tr>
                        <td><span class="badge bg-primary">Group</span></td>
                        <td>${payment.from}</td>
                        <td>${payment.to}</td>
                        <td>$${amount}</td>
                    </tr>
                `;
            });
            
            // Add internal settlements
            (settlementData.internal_settlements || []).forEach(payment => {
                const amount = parseFloat(payment.amount).toFixed(2);
                
                historyHtml += `
                    <tr>
                        <td><span class="badge bg-secondary">Internal</span></td>
                        <td>${payment.from}</td>
                        <td>${payment.to}</td>
                        <td>$${amount}</td>
                    </tr>
                `;
            });
            
            // Close payments table
            historyHtml += `
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        historyContainer.innerHTML = historyHtml;
    }
});

// Function to toggle settlement details visibility
function toggleSettlementDetails(historyId) {
    const detailsElement = document.getElementById(`details-${historyId}`);
    const toggleElement = document.querySelector(`[data-history-id="${historyId}"] .history-toggle`);
    
    if (detailsElement.style.display === 'none') {
        detailsElement.style.display = 'block';
        toggleElement.textContent = 'Hide Details';
    } else {
        detailsElement.style.display = 'none';
        toggleElement.textContent = 'Show Details';
    }
}