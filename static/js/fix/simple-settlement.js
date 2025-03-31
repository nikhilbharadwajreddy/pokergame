// Simple script to handle settlement display
document.addEventListener('DOMContentLoaded', function() {
    console.log('Simple settlement script loaded');
    
    // Make sure settlement results are hidden on page load
    const settlementResults = document.getElementById('settlementResults');
    if (settlementResults) {
        settlementResults.style.display = 'none';
    }
    
    // Find the calculate settlement button and add our handler
    const settleBtn = document.getElementById('calculate-settlement');
    if (settleBtn) {
        // Override the click event to make sure our code runs
        const originalClickHandler = settleBtn.onclick;
        settleBtn.onclick = null;
        
        settleBtn.addEventListener('click', function(event) {
            console.log('Calculate settlement button clicked');
            
            // Check if settlement calculation is successful (this will happen in the original handlers)
            // We just need to make sure the settlement results are shown
            setTimeout(function() {
                const results = document.getElementById('settlementResults');
                if (results) {
                    console.log('Making settlement results visible');
                    results.style.display = 'block';
                    
                    // Scroll to the results section after a short delay
                    setTimeout(function() {
                        results.scrollIntoView({ behavior: 'smooth' });
                    }, 300);
                }
            }, 1500); // Wait for the original handlers to finish
        });
    }
});
