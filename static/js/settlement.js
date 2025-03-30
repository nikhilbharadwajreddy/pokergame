// Display settlement results
function displaySettlement(result) {
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
}

// Export results as image
function exportSettlementAsImage() {
    html2canvas(document.getElementById('settlementResults'), { 
        backgroundColor: 'white',
        scale: 2
    }).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `poker-settlement-${new Date().toISOString().split('T')[0]}.png`;
        link.click();
    });
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Export button
    document.getElementById('exportSettlement').addEventListener('click', exportSettlementAsImage);
});