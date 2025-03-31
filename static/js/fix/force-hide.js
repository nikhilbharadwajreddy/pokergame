// This script runs immediately before any other JavaScript
(function() {
    // Function to forcibly hide settlement results
    function forceHideResults() {
        console.log('🛑 FORCE HIDE: Running emergency hide script');
        const settlementResults = document.getElementById('settlementResults');
        if (settlementResults) {
            console.log('🛑 FORCE HIDE: Settlement results found, hiding them');
            settlementResults.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; position: absolute !important; z-index: -1 !important;';
            settlementResults.setAttribute('data-force-hidden', 'true');
        }
    }

    // Run immediately as script loads (before DOM is ready)
    forceHideResults();
    
    // Also run when DOM is ready
    document.addEventListener('DOMContentLoaded', forceHideResults);
    
    // Also run on page show (back button navigation)
    window.addEventListener('pageshow', forceHideResults);
    
    // Try running again after a short delay
    setTimeout(forceHideResults, 100);
    setTimeout(forceHideResults, 500);
    setTimeout(forceHideResults, 1000);
    
    // Create a MutationObserver to watch for changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Check if the settlement results are being shown
            const settlementResults = document.getElementById('settlementResults');
            if (settlementResults && 
                (getComputedStyle(settlementResults).display !== 'none' || 
                 getComputedStyle(settlementResults).visibility !== 'hidden')) {
                
                // Only hide results if they don't have the special flag from our calculate button
                if (!settlementResults.hasAttribute('data-manually-shown')) {
                    console.log('🛑 FORCE HIDE: Detected settlement results becoming visible, hiding them');
                    settlementResults.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important;';
                }
            }
        });
    });
    
    // Start observing once DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Observe the body for any changes
        observer.observe(document.body, { 
            childList: true, 
            subtree: true, 
            attributes: true,
            attributeFilter: ['style', 'class']
        });
        
        // Override the Calculate Settlement button
        const settleBtns = document.querySelectorAll('#calculate-settlement');
        settleBtns.forEach(function(btn) {
            // Remove existing listeners and add our own
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', function() {
                // This is the only place where we'll allow the results to show
                const settlementResults = document.getElementById('settlementResults');
                if (settlementResults) {
                    // First make sure it's hidden
                    settlementResults.style.cssText = 'display: none !important; visibility: hidden !important;';
                    
                    // Check for proper net balance
                    if (typeof isNetBalanceZero === 'function' && !isNetBalanceZero()) {
                        alert('Net profit/losses must be zero before calculating settlement.');
                        return;
                    }
                    
                    // Call the original calculate settlement function if it exists
                    if (typeof calculateSettlement === 'function') {
                        this.innerHTML = '<i class="bi bi-hourglass-split"></i> Calculating...';
                        
                        calculateSettlement()
                            .then(function(result) {
                                console.log('✅ Settlement calculated successfully');
                                
                                // This is the ONLY place where we'll show the results
                                setTimeout(function() {
                                    settlementResults.setAttribute('data-manually-shown', 'true');
                                    settlementResults.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; position: relative !important; z-index: 100 !important;';
                                    
                                    // Scroll to the results
                                    setTimeout(function() {
                                        window.scrollTo({
                                            top: settlementResults.offsetTop - 20,
                                            behavior: 'smooth'
                                        });
                                    }, 100);
                                }, 100);
                            })
                            .catch(function(error) {
                                console.error('❌ Error calculating settlement:', error);
                                alert('Error calculating settlement. Please try again.');
                            })
                            .finally(() => {
                                newBtn.innerHTML = '<i class="bi bi-calculator"></i> Calculate Settlement';
                            });
                    }
                }
            });
        });
    });
})();
