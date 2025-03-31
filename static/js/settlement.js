// Debug function to help troubleshoot
function debugSettlementDisplay() {
    console.log('=== SETTLEMENT DEBUG INFO ===');
    const resultsSection = document.getElementById('settlementResults');
    if (resultsSection) {
        console.log('Settlement section found:', resultsSection);
        console.log('Display style:', getComputedStyle(resultsSection).display);
        console.log('Position:', getComputedStyle(resultsSection).position);
        console.log('Z-index:', getComputedStyle(resultsSection).zIndex);
        console.log('Visibility:', getComputedStyle(resultsSection).visibility);
        console.log('Opacity:', getComputedStyle(resultsSection).opacity);
        console.log('Height:', getComputedStyle(resultsSection).height);
        console.log('Parent element:', resultsSection.parentElement);
    } else {
        console.error('Settlement section NOT found');
    }
    
    // Check for child elements
    const playerResults = document.getElementById('playerResults');
    const groupResults = document.getElementById('groupResults');
    const paymentResults = document.getElementById('paymentResults');
    
    console.log('Player results element:', playerResults ? 'Found' : 'NOT found');
    console.log('Group results element:', groupResults ? 'Found' : 'NOT found');
    console.log('Payment results element:', paymentResults ? 'Found' : 'NOT found');
    console.log('========================');
}

// Function to ensure settlement results are visible
function showSettlementResults() {
    console.log('Attempting to show settlement results...');
    const resultsSection = document.getElementById('settlementResults');
    if (resultsSection) {
        console.log('Results section found');
        // Force display block with !important
        resultsSection.setAttribute('style', 'display: block !important; margin-top: 60px !important');
        console.log('Set display style to block with !important');
        
        // Unhide any parent elements if needed
        let parent = resultsSection.parentElement;
        while (parent) {
            if (getComputedStyle(parent).display === 'none') {
                parent.style.display = 'block';
            }
            parent = parent.parentElement;
        }
        
        // Move to the bottom of the page
        document.body.appendChild(resultsSection);
        
        // Scroll to make visible
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }, 300);
        
        return true;
    }
    return false;
}// Display settlement warnings
function displaySettlementWarnings(result) {
    const warningsElement = document.getElementById('settlementWarnings');
    const warningsList = document.getElementById('warningList');
    
    // Clear previous warnings
    warningsList.innerHTML = '';
    
    // Check for tie warnings
    const tieWarnings = result.tie_warnings || [];
    let hasWarnings = false;
    
    if (tieWarnings.length > 0) {
        tieWarnings.forEach(warning => {
            const li = document.createElement('li');
            li.innerHTML = warning;
            warningsList.appendChild(li);
            hasWarnings = true;
        });
    }
    
    // Check for save errors
    if (result.save_error) {
        const li = document.createElement('li');
        li.innerHTML = `Error saving settlement: ${result.save_error}`;
        warningsList.appendChild(li);
        hasWarnings = true;
    }
    
    // Show/hide warnings section
    warningsElement.style.display = hasWarnings ? 'block' : 'none';
}

// Display settlement history
function displaySettlementHistory(result) {
    const historyElement = document.getElementById('settlementHistoryContainer');
    const historyList = document.getElementById('settlementHistoryList');
    const noHistoryMessage = document.getElementById('noHistoryMessage');
    
    // Clear previous history
    historyList.innerHTML = '';
    
    // Check if there's settlement history
    const history = result.settlement_history || [];
    
    if (history.length > 0) {
        history.forEach((entry, index) => {
            const li = document.createElement('li');
            const date = new Date(entry.calculated_at);
            li.innerHTML = `
                <div class="history-entry">
                    <span class="history-date">${date.toLocaleString()}</span>
                    <button class="btn btn-sm btn-outline-secondary view-history-btn" data-index="${index}">View</button>
                </div>
            `;
            historyList.appendChild(li);
        });
        
        // Add event listeners to view buttons
        document.querySelectorAll('.view-history-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                displayHistoricalSettlement(history[index].settlement);
            });
        });
        
        noHistoryMessage.style.display = 'none';
    } else {
        noHistoryMessage.style.display = 'block';
    }
}

// Display a historical settlement
function displayHistoricalSettlement(settlementData) {
    // Display the historical settlement data
    // This is similar to displaySettlement but marks it as historical
    alert('Historical settlement viewing is not fully implemented yet.');
    console.log('Historical settlement data:', settlementData);
}

// Display settlement results
function displaySettlement(result) {
    // Debug first to see what state we're starting with
    debugSettlementDisplay();
    
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
    
    // Update date display if element exists
    const settlementDateEl = document.getElementById('settlementDate');
    if (settlementDateEl) {
        settlementDateEl.textContent = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    }
    
    // Display warnings if present
    displaySettlementWarnings(result);
    
    // Display settlement history if available
    displaySettlementHistory(result);
    
    // FIRST: Make sure the settlement results section is visible
    if (showSettlementResults()) {
        
        // Update player results table
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
        const playerResultsElement = document.getElementById('playerResults');
        if (playerResultsElement) {
            playerResultsElement.innerHTML = playerResultsHtml;
        } else {
            console.error('Player results element not found');
        }
        
        // Update group results table
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
        const groupResultsElement = document.getElementById('groupResults');
        if (groupResultsElement) {
            groupResultsElement.innerHTML = groupResultsHtml;
        } else {
            console.error('Group results element not found');
        }
        
        // Update payment results table
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
        const paymentResultsElement = document.getElementById('paymentResults');
        if (paymentResultsElement) {
            paymentResultsElement.innerHTML = paymentResultsHtml;
        } else {
            console.error('Payment results element not found');
        }
        
        // Don't scroll here, we already do it in showSettlementResults()
    }
    
    // SECOND: Also update the modern settlement modal (as backup)
    if (typeof displaySettlementMCP === 'function') {
        displaySettlementMCP(result);
    }
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