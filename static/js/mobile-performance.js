// Mobile-optimized performance improvements for settlement calculations
document.addEventListener('DOMContentLoaded', function() {
    console.log('Mobile performance optimizations loaded');
    
    // Check if this is a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        console.log('Mobile device detected, applying optimizations');
        applyMobileOptimizations();
    }
    
    function applyMobileOptimizations() {
        // 1. Override the Calculate Settlement button click handler for mobile
        const settleBtn = document.getElementById('calculate-settlement');
        if (settleBtn) {
            // Add a progress indicator before calculation starts
            settleBtn.addEventListener('click', function() {
                // Create loading overlay
                const loadingOverlay = document.createElement('div');
                loadingOverlay.id = 'mobile-loading-overlay';
                loadingOverlay.innerHTML = `
                    <div class="loading-content">
                        <div class="spinner-border text-light" role="status"></div>
                        <p>Calculating settlements...</p>
                        <small>This may take a moment on mobile devices</small>
                    </div>
                `;
                document.body.appendChild(loadingOverlay);
                
                // Force immediate rendering
                setTimeout(() => {
                    console.log('Mobile calculation started');
                }, 50);
            }, true); // Use capture to run before other handlers
        }
        
        // 2. Create optimized version of directDisplaySettlement
        window.optimizedMobileDisplay = function(result) {
            console.log('Using optimized mobile display');
            
            try {
                // Remove loading overlay if it exists
                const overlay = document.getElementById('mobile-loading-overlay');
                if (overlay) {
                    overlay.remove();
                }
                
                // Get settlement results container
                const settlementSection = document.getElementById('settlementResults');
                if (!settlementSection) {
                    console.error('Settlement section not found!');
                    return false;
                }
                
                // CRITICAL: Force display with inline style
                settlementSection.style.cssText = 'display: block !important; visibility: visible !important;';
                
                // Set position and appearance
                settlementSection.style.zIndex = '1000';
                settlementSection.style.position = 'relative';
                settlementSection.style.marginTop = '60px';
                
                // Create very simple HTML outputs for faster rendering
                let html = '';
                
                // 1. Player Results - simplified version
                const playerResults = result.player_results || [];
                if (playerResults.length > 0) {
                    html += '<div class="table-responsive mb-4">';
                    html += '<table class="table table-sm">';
                    html += '<thead><tr><th>Player</th><th>Group</th><th>P/L</th></tr></thead>';
                    html += '<tbody>';
                    
                    playerResults.forEach(player => {
                        const profitLoss = player.profit_loss;
                        const formattedAmount = Math.abs(profitLoss).toFixed(2);
                        const cssClass = profitLoss >= 0 ? 'profit' : 'loss';
                        html += `<tr>
                            <td>${player.name}</td>
                            <td>${player.group !== 'Ungrouped' ? player.group : ''}</td>
                            <td class="${cssClass}">${profitLoss >= 0 ? '+' : '-'}$${formattedAmount}</td>
                        </tr>`;
                    });
                    
                    html += '</tbody></table></div>';
                }
                
                // 2. Payments - simplified version
                const payments = [...(result.group_settlements || []), ...(result.internal_settlements || [])];
                
                if (payments.length > 0) {
                    html += '<div class="table-responsive">';
                    html += '<table class="table table-sm">';
                    html += '<thead><tr><th>From</th><th>To</th><th>Amount</th></tr></thead>';
                    html += '<tbody>';
                    
                    payments.forEach(payment => {
                        const formattedAmount = parseFloat(payment.amount).toFixed(2);
                        html += `<tr>
                            <td>${payment.from}</td>
                            <td>${payment.to}</td>
                            <td>$${formattedAmount}</td>
                        </tr>`;
                    });
                    
                    html += '</tbody></table></div>';
                }
                
                // 3. Add credit with donation link
                html += `
                <div class="settlement-credit text-center mt-4">
                    Made with <i class="bi bi-heart-fill text-danger"></i> by Nikhil and Praneeth!
                    <div class="mt-2">
                        <a href="https://buymeacoffee.com/nikhilreddy" target="_blank" class="text-muted">
                            <i class="bi bi-cup-hot"></i> Spend A Dollar on server, If you wanna make it work faster!
                        </a>
                    </div>
                </div>
                <div class="text-end mt-3">
                    <button id="mobileExportBtn" class="btn btn-primary">
                        <i class="bi bi-download"></i> Export
                    </button>
                </div>`;
                
                // Replace the entire inner content at once (much faster than updating tables separately)
                settlementSection.querySelector('.card-body').innerHTML = html;
                
                // Update the date display
                const now = new Date();
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const dateStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
                
                const dateDisplay = settlementSection.querySelector('#settlementDate');
                if (dateDisplay) {
                    dateDisplay.textContent = dateStr;
                }
                
                // Add event listener to the new export button
                const exportBtn = document.getElementById('mobileExportBtn');
                if (exportBtn) {
                    exportBtn.addEventListener('click', function() {
                        // Simple export function
                        try {
                            html2canvas(settlementSection, { 
                                backgroundColor: 'white',
                                scale: 2
                            }).then(canvas => {
                                const link = document.createElement('a');
                                link.href = canvas.toDataURL('image/png');
                                link.download = `settlement-${new Date().toISOString().slice(0,10)}.png`;
                                link.click();
                            });
                        } catch (err) {
                            console.error('Export error:', err);
                            alert('Export failed. Please try again.');
                        }
                    });
                }
                
                // Scroll to results section with better behavior
                setTimeout(() => {
                    console.log('Enabling page scrolling');
                    // First enable scrolling
                    document.body.style.overflow = 'auto';
                    document.body.style.height = 'auto';
                    document.documentElement.style.overflow = 'auto';
                    document.documentElement.style.height = 'auto';
                    
                    // Unlock any potential scroll locks
                    document.ontouchmove = null;
                    
                    console.log('Scrolling to settlement results');
                    // Then scroll to the element
                    window.scrollTo({
                        top: settlementSection.offsetTop - 20,
                        behavior: 'smooth'
                    });
                }, 300);
                
                return true;
            } catch (err) {
                console.error('Error in optimized mobile display:', err);
                // Remove loading overlay if it exists
                const overlay = document.getElementById('mobile-loading-overlay');
                if (overlay) {
                    overlay.remove();
                }
                return false;
            }
        };
        
        // 3. Override calculateSettlement function to use optimized display on mobile
        const originalCalculateSettlement = window.calculateSettlement;
        if (originalCalculateSettlement) {
            window.calculateSettlement = function() {
                return originalCalculateSettlement().then(result => {
                    // Try optimized display first
                    const success = optimizedMobileDisplay(result);
                    if (!success) {
                        // Fall back to original display method
                        console.log('Falling back to original display method');
                        if (typeof directDisplaySettlement === 'function') {
                            directDisplaySettlement(result);
                        } else if (typeof displaySettlement === 'function') {
                            displaySettlement(result);
                        }
                    }
                    return result;
                });
            };
        }
    }
    
    // Add CSS for the loading overlay
    const style = document.createElement('style');
    style.textContent = `
        #mobile-loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        }
        
        .loading-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            color: white;
            text-align: center;
        }
        
        .loading-content p {
            margin-top: 15px;
            font-weight: bold;
        }
        
        .loading-content small {
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);
});