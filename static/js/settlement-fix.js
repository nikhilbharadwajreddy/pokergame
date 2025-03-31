// Enhanced script to ensure settlement results display properly on both desktop and mobile
document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced settlement fix script loaded');
    
    // Make sure settlement results are hidden on page load
    const settlementResults = document.getElementById('settlementResults');
    if (settlementResults) {
        settlementResults.style.display = 'none';
    }
    
    // Add a mutation observer to watch for changes to the #settlementResults element
    const targetNode = document.getElementById('settlementResults');
    if (targetNode) {
        console.log('Found settlement results section, setting up observer');
        
        // Create an observer to watch for changes to the style attribute
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'style') {
                    const displayStyle = targetNode.style.display;
                    console.log('Settlement results display style changed to:', displayStyle);
                    
                    // If it was set to 'block', make sure it stays that way
                    if (displayStyle === 'block') {
                        // Force it to stay visible with !important
                        setTimeout(() => {
                            targetNode.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; margin-top: 60px !important;';
                            
                            // Fix scrolling
                            document.body.style.overflow = 'auto';
                            document.body.style.height = 'auto';
                            document.documentElement.style.overflow = 'auto';
                            document.documentElement.style.height = 'auto';
                            
                            // Better scrolling behavior
                            window.scrollTo({
                                top: targetNode.offsetTop - 20,
                                behavior: 'smooth'
                            });
                        }, 100);
                    }
                }
            });
        });
        
        // Start observing
        observer.observe(targetNode, { attributes: true });
    }
    
    // Find any Calculate Settlement buttons and add an additional click handler
    const settleBtn = document.getElementById('calculate-settlement');
    if (settleBtn) {
        // Add our special click handler after the normal one
        settleBtn.addEventListener('click', function() {
            console.log('Calculate Settlement clicked, setting timer to check visibility');
            
            // Immediately try to ensure the results are visible
            ensureSettlementResultsVisible();
            
            // Also set up a timer to repeatedly check visibility
            let checkCount = 0;
            const checkInterval = setInterval(() => {
                checkCount++;
                ensureSettlementResultsVisible();
                
                // Stop checking after 5 attempts
                if (checkCount >= 5) {
                    clearInterval(checkInterval);
                }
            }, 800); // Check every 800ms for 5 times
        });
    }
    
    // Function to ensure settlement results are visible
    function ensureSettlementResultsVisible() {
        const results = document.getElementById('settlementResults');
        if (results) {
            const displayStyle = window.getComputedStyle(results).display;
            
            // Check if the results should be shown
            const shouldBeShown = results.getAttribute('data-status') === 'populated';
            
            if (shouldBeShown) {
                // Show results if they should be visible but aren't
                if (displayStyle === 'none') {
                    console.log('Showing settlement results');
                    results.style.display = 'block';
                    results.style.visibility = 'visible';
                    results.style.opacity = '1';
                }
                
                // Scroll to the results section
                setTimeout(() => {
                    window.scrollTo({
                        top: results.offsetTop - 20,
                        behavior: 'smooth'
                    });
                }, 100);
                
                return true;
            } else {
                // Hide results if they should be hidden but aren't
                if (displayStyle !== 'none') {
                    console.log('Hiding settlement results');
                    results.style.display = 'none';
                }
                return false;
            }
        }
        return false;
    }
    
    // Also run on page load in case settlement results are already there
    setTimeout(ensureSettlementResultsVisible, 500);
});