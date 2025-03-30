// Display settlement results
function displaySettlement(result) {
    // Store settlement data globally for use with the save buttons
    window.currentSettlementData = result;
    console.log('Settlement data stored for saving:', result);
    
    // Automatically save the settlement to history
    const gameId = document.querySelector('input[name="game_id"]')?.value;
    
    if (gameId) {
        saveSettlementHistory(gameId, result, null, false);
    }
    
    // Format date
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    document.getElementById('settlementDate').textContent = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    
    // Display player results in table rows
    let playerHtml = '';
    
    // Use the player_results directly from the backend
    (result.player_results || []).forEach(player => {
        const buyIn = parseFloat(player.buy_in).toFixed(2);
        const finalAmount = parseFloat(player.final_amount).toFixed(2);
        const profitLoss = Math.abs(player.profit_loss).toFixed(2);
        
        playerHtml += `
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
    
    // Display group summary in table rows
    let groupHtml = '';
    
    // Display group summary if available
    if (result.group_summary && result.group_summary.length > 0) {
        result.group_summary.forEach(group => {
            const initial = parseFloat(group.initial).toFixed(2);
            const final = parseFloat(group.final).toFixed(2);
            const net = parseFloat(group.net).toFixed(2);
            const settlement = parseFloat(group.settlement || 0).toFixed(2);
            
            groupHtml += `
                <tr>
                    <td>${group.name !== 'Ungrouped' ? group.name : 'No Group'}</td>
                    <td>$${initial}</td>
                    <td>$${final}</td>
                    <td class="${group.net >= 0 ? 'profit' : 'loss'}">
                        ${group.net >= 0 ? '+' : '-'}$${Math.abs(net)}
                    </td>
                    <td class="${group.settlement >= 0 ? 'profit' : 'loss'}">
                        ${Math.abs(parseFloat(settlement)) > 0.01 ? (group.settlement >= 0 ? '+' : '-') + '$' + Math.abs(settlement) : '-'}
                    </td>
                </tr>
            `;
        });
    }
    
    // Process and display group settlements
    const groupPayments = (result.group_settlements || []);
    const internalPayments = (result.internal_settlements || []);
    
    // Display all payments
    let paymentHtml = '';
    
    // First, display group settlements
    groupPayments.forEach(payment => {
        const amount = parseFloat(payment.amount).toFixed(2);
        
        paymentHtml += `
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
        
        paymentHtml += `
            <tr>
                <td><span class="badge bg-secondary">Internal</span></td>
                <td>${payment.from}</td>
                <td>${payment.to}</td>
                <td class="amount">$${amount}</td>
                <td class="text-muted small">${payment.note || ''}</td>
            </tr>
        `;
    });
    
    // Log for debugging
    console.log('Group Payments:', groupPayments);
    console.log('Internal Payments:', internalPayments);
    
    // Update content
    document.getElementById('playerResults').innerHTML = playerHtml || '<tr><td colspan="5" class="text-center">No player results</td></tr>';
    document.getElementById('groupResults').innerHTML = groupHtml || '<tr><td colspan="5" class="text-center">No group data</td></tr>';
    document.getElementById('paymentResults').innerHTML = paymentHtml || '<tr><td colspan="5" class="text-center">No payments needed</td></tr>';
    
    // Show settlement results
    document.getElementById('settlementResults').style.display = 'block';
    
    // Hide all buttons except export button
    const buttons = document.querySelectorAll('.modal-footer button');
    buttons.forEach(button => {
        if (button.id !== 'exportSettlement') {
            button.style.display = 'none';
        }
    });
}

// Export results as image
function exportSettlementAsImage() {
    // Temporarily hide the export button
    const exportBtn = document.getElementById('exportSettlement');
    if (exportBtn) {
        exportBtn.style.display = 'none';
    }
    
    html2canvas(document.getElementById('settlementResults'), { 
        backgroundColor: 'white',
        scale: 2
    }).then(canvas => {
        // Restore the export button
        if (exportBtn) {
            exportBtn.style.display = '';
        }
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `poker-settlement-${new Date().toISOString().split('T')[0]}.png`;
        link.click();
    });
}

// Save to history and clear scores
function saveSettlementHistory(gameId, settlementData, playerId = null, shouldClearScores = false) {
    // First save to history
    fetch('/save_settlement_history', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            game_id: gameId,
            settlement_data: settlementData,
            player_id: playerId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // If we need to clear scores after saving
            if (shouldClearScores) {
                clearGameScores(gameId);
            }
            
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'alert alert-success alert-dismissible fade show mt-3';
            successMsg.innerHTML = `
                Settlement saved to history. <a href="/dashboard">View in dashboard</a>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;
            document.getElementById('settlementResults').after(successMsg);
            
            // Automatically dismiss after 5 seconds
            setTimeout(() => {
                successMsg.remove();
            }, 5000);
        } else {
            console.error('Error saving settlement history:', data.error);
            alert('Error saving settlement history: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error saving settlement history:', error);
        alert('Error saving settlement history. Please try again.');
    });
}

// Clear game scores
function clearGameScores(gameId) {
    fetch('/clear_game_scores', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            game_id: gameId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Game scores cleared successfully');
            // Optionally refresh the page to show updated scores
            // window.location.reload();
        } else {
            console.error('Error clearing game scores:', data.error);
        }
    })
    .catch(error => {
        console.error('Error clearing game scores:', error);
    });
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Export button
    const exportBtn = document.getElementById('exportSettlement');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportSettlementAsImage);
    }
});