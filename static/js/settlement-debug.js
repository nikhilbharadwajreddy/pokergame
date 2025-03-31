// Debug script for settlement display issues
document.addEventListener('DOMContentLoaded', function() {
    console.log('Settlement debug script loaded');
    console.log('Checking existing calculate-settlement button');    
    
    // Monitor the Calculate Settlement button
    const calculateBtn = document.getElementById('calculate-settlement');
    if (calculateBtn) {
        console.log('Found calculate-settlement button, adding debug observer');
        // Add a listener to monitor clicks
        calculateBtn.addEventListener('click', function() {
            console.log('Calculate Settlement clicked');
            // Wait a few seconds then check if results appeared
            setTimeout(checkSettlementPopulation, 3000);
        });
    } else {
        console.log('calculate-settlement button not found');
    }
    
    // Check if the Settlement Results section exists
    const settlementSection = document.getElementById('settlementResults');
    if (settlementSection) {
        console.log('Settlement section found on page load');
        
        // Add a test button to show settlement results
        const testButton = document.createElement('button');
        testButton.innerText = 'Show Settlement Results (Debug)';
        testButton.className = 'btn btn-warning mb-3';
        testButton.style.position = 'fixed';
        testButton.style.bottom = '10px';
        testButton.style.right = '10px';
        testButton.style.zIndex = '9999';
        
        testButton.addEventListener('click', function() {
            console.log('Debug button clicked');
            showSettlementResultsManually();
        });
        
        document.body.appendChild(testButton);
    } else {
        console.error('Settlement section NOT found on page load');
    }
});

// Manual function to show settlement results
function showSettlementResultsManually() {
    const settlementSection = document.getElementById('settlementResults');
    if (settlementSection) {
        // First unhide
        settlementSection.style.display = 'block';
        
        // Move to bottom of page if needed
        if (settlementSection.offsetTop < 500) {
            document.body.appendChild(settlementSection);
        }
        
        // Add some debug content
        const debugContent = `
            <div class="card">
                <div class="card-header">
                    <h4>DEBUG: Settlement Results</h4>
                </div>
                <div class="card-body">
                    <p>This is debug content to verify that the settlement results section can be displayed.</p>
                    <p>If you're seeing this, the section is working but might not be getting properly populated with data.</p>
                </div>
            </div>
        `;
        
        // Set the content and make it visible with important
        settlementSection.innerHTML = debugContent;
        settlementSection.setAttribute('style', 'display: block !important; margin-top: 100px !important; padding: 20px; background-color: yellow;');
        
        // Scroll to it
        settlementSection.scrollIntoView({ behavior: 'smooth' });
        
        console.log('Settlement section should now be visible');
    } else {
        console.error('Settlement section not found');
        
        // Create a new section if it doesn't exist
        const newSection = document.createElement('div');
        newSection.id = 'settlementResults';
        newSection.className = 'settlement-section';
        newSection.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h4>DEBUG: Created Settlement Results</h4>
                </div>
                <div class="card-body">
                    <p>This is a newly created settlement section because the original one was not found.</p>
                </div>
            </div>
        `;
        
        newSection.setAttribute('style', 'display: block !important; margin-top: 100px !important; padding: 20px; background-color: orange;');
        
        document.body.appendChild(newSection);
        newSection.scrollIntoView({ behavior: 'smooth' });
        
        console.log('Created new settlement section');
    }
}

// Check if settlement content was populated
function checkSettlementPopulation() {
    console.log('Checking if settlement content was populated');
    
    const playerResults = document.getElementById('playerResults');
    const groupResults = document.getElementById('groupResults');
    const paymentResults = document.getElementById('paymentResults');
    
    if (playerResults) {
        console.log('Player results HTML content:', playerResults.innerHTML.trim().substring(0, 100) + '...');
        if (playerResults.innerHTML.trim() === '') {
            console.log('Player results is empty!');
        }
    }
    
    if (groupResults) {
        console.log('Group results HTML content:', groupResults.innerHTML.trim().substring(0, 100) + '...');
        if (groupResults.innerHTML.trim() === '') {
            console.log('Group results is empty!');
        }
    }
    
    if (paymentResults) {
        console.log('Payment results HTML content:', paymentResults.innerHTML.trim().substring(0, 100) + '...');
        if (paymentResults.innerHTML.trim() === '') {
            console.log('Payment results is empty!');
        }
    }
    
    // Check overall visibility
    const settlementSection = document.getElementById('settlementResults');
    if (settlementSection) {
        console.log('Settlement section display:', getComputedStyle(settlementSection).display);
        
        // If it's not visible, force it visible and populate with test data
        if (getComputedStyle(settlementSection).display === 'none') {
            console.log('Settlement section is still hidden, forcing display...');
            settlementSection.style.display = 'block';
            
            if (playerResults && playerResults.innerHTML.trim() === '') {
                console.log('Adding test data to player results');
                playerResults.innerHTML = `
                    <tr>
                        <td>Test Player</td>
                        <td>Test Group</td>
                        <td>$100.00</td>
                        <td>$150.00</td>
                        <td class="profit">+$50.00</td>
                    </tr>
                `;
            }
        }
    }
}
