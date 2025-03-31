// Combined settlement fixes

// 1. Override show functions to properly display settlement results
const originalDirectDisplay = window.directDisplaySettlement;
window.directDisplaySettlement = function(result) {
    // Call the original function
    if (typeof originalDirectDisplay === 'function') {
        const success = originalDirectDisplay(result);
        
        // Add our class to make the settlement results visible
        const settlementResults = document.getElementById('settlementResults');
        if (settlementResults) {
            settlementResults.classList.add('show-results');
        }
        
        return success;
    }
    return false;
};

// Override the displaySettlement function
const originalDisplaySettlement = window.displaySettlement;
window.displaySettlement = function(result) {
    // Call the original function
    if (typeof originalDisplaySettlement === 'function') {
        const success = originalDisplaySettlement(result);
        
        // Add our class to make the settlement results visible
        const settlementResults = document.getElementById('settlementResults');
        if (settlementResults) {
            settlementResults.classList.add('show-results');
        }
        
        return success;
    }
    return false;
};

// 2. Fix export functionality to hide donation text
document.addEventListener('DOMContentLoaded', function() {
    // Completely replace the export button to remove all other handlers
    const exportBtn = document.getElementById('exportSettlement');
    if (!exportBtn) return;
    
    // Clone and replace the button to remove all existing handlers
    const newExportBtn = exportBtn.cloneNode(true);
    exportBtn.parentNode.replaceChild(newExportBtn, exportBtn);
    
    // Add our clean handler to the new button
    newExportBtn.addEventListener('click', function(e) {
        // Prevent default behavior
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation(); // Stop other handlers on same element
        
        // Elements to hide during export
        const elementsToHide = [
            document.querySelector('.settlement-credit .mt-2'),          // Donation text
            document.querySelector('.text-end.mt-3'),                   // Export button container
            ...document.querySelectorAll('.info-icon'),                 // All info icons
            ...document.querySelectorAll('.alert-info, .alert-primary'), // Blue notification bars
            document.querySelector('#exportSettlement'),                // Export button itself
            document.querySelector('.settlement-credit'),               // Entire credit section
            document.querySelector('.card-header'),                      // Any card headers
        ];
        
        // Store original states
        const originalStates = [];
        
        // Hide elements
        elementsToHide.forEach(el => {
            if (el) {
                originalStates.push({ element: el, display: el.style.display });
                el.style.display = 'none';
            }
        });
        
        // Use html2canvas to create an image
        html2canvas(document.getElementById('settlementResults'), { 
            backgroundColor: 'white',
            scale: 2
        }).then(function(canvas) {
            // Restore elements
            originalStates.forEach(item => {
                item.element.style.display = item.display;
            });
            
            // Download the image
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `poker-settlement-${new Date().toISOString().split('T')[0]}.png`;
            link.click();
        }).catch(function(error) {
            console.error('Error generating image:', error);
            
            // Ensure elements are restored in case of error
            originalStates.forEach(item => {
                item.element.style.display = item.display;
            });
        });
    });
});
