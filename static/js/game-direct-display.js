// Enhanced function to directly populate and display settlement results
function directDisplaySettlement(result) {
    console.log('Direct display of settlement results');
    
    // Make sure settlement section is initially hidden to reset any previous state
    const allSections = document.querySelectorAll('.settlement-section');
    allSections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Make sure the settlement section exists
    const settlementSection = document.getElementById('settlementResults');
    if (!settlementSection) {
        console.error('Settlement section not found!');
        return false;
    }
    
    // CRITICAL: Show settlement section with clean styling
    settlementSection.style.display = 'block';
    settlementSection.style.visibility = 'visible';
    settlementSection.style.opacity = '1';
    settlementSection.style.zIndex = '100';
    settlementSection.style.position = 'relative';
    settlementSection.style.marginTop = '60px';
    
    // Add data attribute to help with debugging
    settlementSection.setAttribute('data-status', 'populated');
    // 1. Populate player results
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
    
    // 2. Populate group results
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
    
    // 3. Populate payment results
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
    
    // 4. Set the settlement date
    const settlementDateEl = document.getElementById('settlementDate');
    if (settlementDateEl) {
        const now = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        settlementDateEl.textContent = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    }
    
    // 5. Scroll to the results section
    setTimeout(() => {
        // Try both approaches to maximize compatibility across browsers
        settlementSection.scrollIntoView({ behavior: 'smooth' });
        
        // Also use window.scrollTo as a fallback
        window.scrollTo({
            top: settlementSection.offsetTop - 20,
            behavior: 'smooth'
        });
        
        // Double check visibility after scrolling
        setTimeout(() => {
            // Final check to ensure visibility
            if (window.getComputedStyle(settlementSection).display !== 'block') {
                console.log('Final visibility check - forcing display again');
                settlementSection.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; z-index: 100 !important; position: relative !important; margin-top: 60px !important;';
            }
        }, 500);
    }, 300);
    
    return true;
}
