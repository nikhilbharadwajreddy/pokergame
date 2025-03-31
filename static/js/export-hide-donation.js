// Script to hide donation text during export
document.addEventListener('DOMContentLoaded', function() {
    // Find the export button
    const exportBtn = document.getElementById('exportSettlement');
    if (!exportBtn) return;
    
    // Override the export button's click handler
    exportBtn.addEventListener('click', function(e) {
        // Prevent the default export behavior
        e.preventDefault();
        e.stopPropagation();
        
        // Find elements to hide
        const donationText = document.querySelector('.settlement-credit .mt-2');
        let originalDisplayState = null;
        
        // Hide donation text
        if (donationText) {
            originalDisplayState = donationText.style.display;
            donationText.style.display = 'none';
        }
        
        // Use html2canvas to create an image
        html2canvas(document.getElementById('settlementResults'), { 
            backgroundColor: 'white',
            scale: 2
        }).then(function(canvas) {
            // Restore donation text
            if (donationText) {
                donationText.style.display = originalDisplayState;
            }
            
            // Download the image
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `poker-settlement-${new Date().toISOString().split('T')[0]}.png`;
            link.click();
        }).catch(function(error) {
            console.error('Error generating image:', error);
            
            // Ensure elements are restored in case of error
            if (donationText) {
                donationText.style.display = originalDisplayState;
            }
        });
        
        return false;
    });
});
