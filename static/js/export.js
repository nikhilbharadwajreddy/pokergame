// Function to export game settlement as image
function exportGameSettlement(gameId, historyId) {
    fetch(`/export_game_settlement?game_id=${gameId}&history_id=${historyId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Create and show a temporary modal
                const modal = document.createElement('div');
                modal.className = 'modal export-modal';
                modal.style.display = 'block';
                modal.style.position = 'fixed';
                modal.style.zIndex = '9999';
                modal.style.left = '0';
                modal.style.top = '0';
                modal.style.width = '100%';
                modal.style.height = '100%';
                modal.style.overflow = 'auto';
                modal.style.backgroundColor = 'rgba(0,0,0,0.4)';
                
                // Create modal content
                const modalContent = document.createElement('div');
                modalContent.className = 'modal-content';
                modalContent.style.backgroundColor = '#fff';
                modalContent.style.margin = '5% auto';
                modalContent.style.padding = '20px';
                modalContent.style.border = '1px solid #888';
                modalContent.style.width = '80%';
                modalContent.style.maxWidth = '800px';
                modalContent.style.borderRadius = '8px';
                modalContent.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                
                // Create modal header
                const header = document.createElement('div');
                header.className = 'modal-header';
                header.style.borderBottom = '1px solid #eee';
                header.style.marginBottom = '20px';
                header.style.paddingBottom = '10px';
                
                const title = document.createElement('h2');
                title.textContent = data.game_name;
                title.style.margin = '0';
                
                const date = document.createElement('div');
                date.textContent = data.date;
                date.style.color = '#666';
                date.style.fontSize = '14px';
                
                header.appendChild(title);
                header.appendChild(date);
                modalContent.appendChild(header);
                
                // Player Results Section
                const playerSection = document.createElement('div');
                playerSection.className = 'section';
                
                const playerTitle = document.createElement('h4');
                playerTitle.textContent = 'Player Results';
                playerTitle.style.marginBottom = '10px';
                playerSection.appendChild(playerTitle);
                
                const playerTable = document.createElement('table');
                playerTable.className = 'table';
                playerTable.style.width = '100%';
                playerTable.style.borderCollapse = 'collapse';
                
                // Table header
                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');
                
                ['Player', 'Group', 'Buy-In', 'Final', 'P/L'].forEach(text => {
                    const th = document.createElement('th');
                    th.textContent = text;
                    th.style.padding = '8px';
                    th.style.textAlign = 'left';
                    th.style.borderBottom = '2px solid #ddd';
                    headerRow.appendChild(th);
                });
                
                thead.appendChild(headerRow);
                playerTable.appendChild(thead);
                
                // Table body
                const tbody = document.createElement('tbody');
                
                const playerResults = data.settlement_data.player_results || [];
                playerResults.forEach(player => {
                    const row = document.createElement('tr');
                    
                    // Player name
                    const nameCell = document.createElement('td');
                    nameCell.textContent = player.name;
                    nameCell.style.padding = '8px';
                    nameCell.style.borderBottom = '1px solid #ddd';
                    row.appendChild(nameCell);
                    
                    // Group
                    const groupCell = document.createElement('td');
                    groupCell.textContent = player.group !== 'Ungrouped' ? player.group : '';
                    groupCell.style.padding = '8px';
                    groupCell.style.borderBottom = '1px solid #ddd';
                    row.appendChild(groupCell);
                    
                    // Buy-in
                    const buyInCell = document.createElement('td');
                    buyInCell.textContent = '$' + parseFloat(player.buy_in).toFixed(2);
                    buyInCell.style.padding = '8px';
                    buyInCell.style.borderBottom = '1px solid #ddd';
                    row.appendChild(buyInCell);
                    
                    // Final amount
                    const finalCell = document.createElement('td');
                    finalCell.textContent = '$' + parseFloat(player.final_amount).toFixed(2);
                    finalCell.style.padding = '8px';
                    finalCell.style.borderBottom = '1px solid #ddd';
                    row.appendChild(finalCell);
                    
                    // Profit/Loss
                    const plCell = document.createElement('td');
                    const profitLoss = parseFloat(player.profit_loss);
                    plCell.textContent = (profitLoss >= 0 ? '+' : '-') + '$' + Math.abs(profitLoss).toFixed(2);
                    plCell.style.padding = '8px';
                    plCell.style.borderBottom = '1px solid #ddd';
                    plCell.style.color = profitLoss >= 0 ? 'green' : 'red';
                    plCell.style.fontWeight = 'bold';
                    row.appendChild(plCell);
                    
                    tbody.appendChild(row);
                });
                
                playerTable.appendChild(tbody);
                playerSection.appendChild(playerTable);
                modalContent.appendChild(playerSection);
                
                // Payments Section
                if ((data.settlement_data.group_settlements && data.settlement_data.group_settlements.length > 0) || 
                    (data.settlement_data.internal_settlements && data.settlement_data.internal_settlements.length > 0)) {
                    
                    const paymentSection = document.createElement('div');
                    paymentSection.className = 'section';
                    paymentSection.style.marginTop = '20px';
                    
                    const paymentTitle = document.createElement('h4');
                    paymentTitle.textContent = 'Payments';
                    paymentTitle.style.marginBottom = '10px';
                    paymentSection.appendChild(paymentTitle);
                    
                    const paymentTable = document.createElement('table');
                    paymentTable.className = 'table';
                    paymentTable.style.width = '100%';
                    paymentTable.style.borderCollapse = 'collapse';
                    
                    // Table header
                    const pthead = document.createElement('thead');
                    const pheaderRow = document.createElement('tr');
                    
                    ['Type', 'From', 'To', 'Amount'].forEach(text => {
                        const th = document.createElement('th');
                        th.textContent = text;
                        th.style.padding = '8px';
                        th.style.textAlign = 'left';
                        th.style.borderBottom = '2px solid #ddd';
                        pheaderRow.appendChild(th);
                    });
                    
                    pthead.appendChild(pheaderRow);
                    paymentTable.appendChild(pthead);
                    
                    // Table body
                    const ptbody = document.createElement('tbody');
                    
                    // Group settlements
                    const groupSettlements = data.settlement_data.group_settlements || [];
                    groupSettlements.forEach(payment => {
                        const row = document.createElement('tr');
                        
                        // Type
                        const typeCell = document.createElement('td');
                        const badge = document.createElement('span');
                        badge.textContent = 'Group';
                        badge.style.backgroundColor = '#0275d8';
                        badge.style.color = 'white';
                        badge.style.padding = '3px 7px';
                        badge.style.borderRadius = '3px';
                        badge.style.fontSize = '12px';
                        typeCell.appendChild(badge);
                        typeCell.style.padding = '8px';
                        typeCell.style.borderBottom = '1px solid #ddd';
                        row.appendChild(typeCell);
                        
                        // From
                        const fromCell = document.createElement('td');
                        fromCell.textContent = payment.from;
                        fromCell.style.padding = '8px';
                        fromCell.style.borderBottom = '1px solid #ddd';
                        row.appendChild(fromCell);
                        
                        // To
                        const toCell = document.createElement('td');
                        toCell.textContent = payment.to;
                        toCell.style.padding = '8px';
                        toCell.style.borderBottom = '1px solid #ddd';
                        row.appendChild(toCell);
                        
                        // Amount
                        const amountCell = document.createElement('td');
                        amountCell.textContent = '$' + parseFloat(payment.amount).toFixed(2);
                        amountCell.style.padding = '8px';
                        amountCell.style.borderBottom = '1px solid #ddd';
                        amountCell.style.fontWeight = 'bold';
                        row.appendChild(amountCell);
                        
                        ptbody.appendChild(row);
                    });
                    
                    // Internal settlements
                    const internalSettlements = data.settlement_data.internal_settlements || [];
                    internalSettlements.forEach(payment => {
                        const row = document.createElement('tr');
                        
                        // Type
                        const typeCell = document.createElement('td');
                        const badge = document.createElement('span');
                        badge.textContent = 'Internal';
                        badge.style.backgroundColor = '#6c757d';
                        badge.style.color = 'white';
                        badge.style.padding = '3px 7px';
                        badge.style.borderRadius = '3px';
                        badge.style.fontSize = '12px';
                        typeCell.appendChild(badge);
                        typeCell.style.padding = '8px';
                        typeCell.style.borderBottom = '1px solid #ddd';
                        row.appendChild(typeCell);
                        
                        // From
                        const fromCell = document.createElement('td');
                        fromCell.textContent = payment.from;
                        fromCell.style.padding = '8px';
                        fromCell.style.borderBottom = '1px solid #ddd';
                        row.appendChild(fromCell);
                        
                        // To
                        const toCell = document.createElement('td');
                        toCell.textContent = payment.to;
                        toCell.style.padding = '8px';
                        toCell.style.borderBottom = '1px solid #ddd';
                        row.appendChild(toCell);
                        
                        // Amount
                        const amountCell = document.createElement('td');
                        amountCell.textContent = '$' + parseFloat(payment.amount).toFixed(2);
                        amountCell.style.padding = '8px';
                        amountCell.style.borderBottom = '1px solid #ddd';
                        amountCell.style.fontWeight = 'bold';
                        row.appendChild(amountCell);
                        
                        ptbody.appendChild(row);
                    });
                    
                    paymentTable.appendChild(ptbody);
                    paymentSection.appendChild(paymentTable);
                    modalContent.appendChild(paymentSection);
                }
                
                // Footer
                const footer = document.createElement('div');
                footer.className = 'modal-footer';
                footer.style.borderTop = '1px solid #eee';
                footer.style.marginTop = '20px';
                footer.style.paddingTop = '10px';
                footer.style.textAlign = 'center';
                
                const footerText = document.createElement('div');
                footerText.textContent = 'Made with ❤️ by Nikhil and Praneeth!';
                footerText.style.color = '#999';
                footerText.style.fontSize = '12px';
                
                footer.appendChild(footerText);
                modalContent.appendChild(footer);
                
                modal.appendChild(modalContent);
                document.body.appendChild(modal);
                
                // Temporarily hide the export button for the image capture
                const exportBtn = document.querySelectorAll('.modal-footer button#exportSettlement');
                if (exportBtn.length > 0) {
                    exportBtn[0].style.display = 'none';
                }
                
                // Use html2canvas to create an image
                html2canvas(modalContent, {
                    backgroundColor: '#fff',
                    scale: 2 // Higher quality
                }).then(canvas => {
                    // Restore the export button
                    if (exportBtn.length > 0) {
                        exportBtn[0].style.display = '';
                    }
                    // Convert to PNG and download
                    const imageUrl = canvas.toDataURL('image/png');
                    const a = document.createElement('a');
                    a.href = imageUrl;
                    a.download = `game_settlement_${data.game_name.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
                    document.body.appendChild(a);
                    a.click();
                    
                    // Clean up
                    document.body.removeChild(a);
                    document.body.removeChild(modal);
                }).catch(error => {
                    console.error('Error creating image:', error);
                    alert('Error exporting settlement. Please try again.');
                    document.body.removeChild(modal);
                });
            } else {
                alert('Error: ' + (data.error || 'Failed to load settlement data'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error exporting settlement. Please try again.');
        });
}