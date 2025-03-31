// This script manages custom info tooltips positioning to ensure they remain visible
// IMPORTANT: We use the class name 'info-tooltip' to avoid conflicts with Bootstrap's tooltips
// Do not use the class name 'tooltip' as it will conflict with Bootstrap
document.addEventListener('DOMContentLoaded', function() {
    // Function to position tooltips optimally
    function positionTooltip(tooltipText) {
        if (!tooltipText) return;
        
        // Reset any previous positioning
        tooltipText.style.left = '50%';
        tooltipText.style.right = 'auto';
        tooltipText.style.bottom = '125%';
        tooltipText.style.top = 'auto';
        tooltipText.style.marginLeft = '-100px';
        tooltipText.style.transform = '';
        
        // Get position data
        const rect = tooltipText.getBoundingClientRect();
        const icon = tooltipText.parentElement.querySelector('.info-icon');
        const iconRect = icon ? icon.getBoundingClientRect() : null;
        
        // Check if tooltip goes off the left side of the screen
        if (rect.left < 10) {
            tooltipText.style.left = '0';
            tooltipText.style.marginLeft = '0';
            if (iconRect) {
                // Position relative to the icon
                tooltipText.style.left = (iconRect.left) + 'px';
            }
        }
        
        // Check if tooltip goes off the right side of the screen
        if (rect.right > window.innerWidth - 10) {
            tooltipText.style.left = 'auto';
            tooltipText.style.right = '0';
            tooltipText.style.marginLeft = '0';
            if (iconRect) {
                // Position relative to the icon, aligned to the right
                const rightEdge = window.innerWidth - iconRect.right;
                tooltipText.style.right = rightEdge + 'px';
            }
        }
        
        // Check if tooltip goes off the top of the screen
        if (rect.top < 10) {
            tooltipText.style.bottom = 'auto';
            tooltipText.style.top = '125%';
            
            // Adjust the arrow to point up instead of down
            const arrow = tooltipText.querySelector('.tooltip-arrow');
            if (arrow) {
                arrow.style.top = '-10px';
                arrow.style.bottom = 'auto';
                arrow.style.borderWidth = '0 10px 10px';
                arrow.style.borderColor = 'transparent transparent #333 transparent';
            }
        }
    }
    
    // Adjust tooltip positions for those that might go off-screen
    document.querySelectorAll('.info-tooltip').forEach(tooltip => {
        // Skip Bootstrap tooltips
        if (tooltip.hasAttribute('data-bs-toggle')) return;
        
        const tooltipText = tooltip.querySelector('.tooltip-text');
        if (!tooltipText) return;
        
        // Add mouse events for better positioning
        tooltip.addEventListener('mouseenter', function() {
            // Make tooltip visible temporarily to measure it
            tooltipText.style.visibility = 'visible';
            tooltipText.style.opacity = '0';
            
            // Position the tooltip optimally
            positionTooltip(tooltipText);
            
            // Now make it fully visible
            setTimeout(() => {
                tooltipText.style.opacity = '1';
            }, 10);
        });
        
        tooltip.addEventListener('mouseleave', function() {
            tooltipText.style.visibility = 'hidden';
            tooltipText.style.opacity = '0';
        });
        
        // Handle touch events for mobile
        tooltip.addEventListener('touchstart', function(e) {
            // Prevent other touch events
            e.preventDefault();
            
            // Toggle visibility
            if (tooltipText.style.visibility === 'visible') {
                tooltipText.style.visibility = 'hidden';
                tooltipText.style.opacity = '0';
            } else {
                // Hide all other tooltips first
                document.querySelectorAll('.info-tooltip .tooltip-text').forEach(tt => {
                    if (tt !== tooltipText) {
                        tt.style.visibility = 'hidden';
                        tt.style.opacity = '0';
                    }
                });
                
                // Make tooltip visible temporarily to measure it
                tooltipText.style.visibility = 'visible';
                tooltipText.style.opacity = '0';
                
                // Position the tooltip optimally
                positionTooltip(tooltipText);
                
                // Now make it fully visible
                setTimeout(() => {
                    tooltipText.style.opacity = '1';
                }, 10);
            }
        });
    });
    
    // Handle tap outside to dismiss tooltips on mobile
    document.addEventListener('touchstart', function(e) {
        if (!e.target.closest('.info-tooltip')) {
            document.querySelectorAll('.info-tooltip .tooltip-text').forEach(tooltipText => {
                tooltipText.style.visibility = 'hidden';
                tooltipText.style.opacity = '0';
            });
        }
    });
    
    // Handle tab navigation for accessibility
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab' || e.key === 'Escape') {
            document.querySelectorAll('.info-tooltip .tooltip-text').forEach(tooltipText => {
                tooltipText.style.visibility = 'hidden';
                tooltipText.style.opacity = '0';
            });
        }
    });
    
    // Handle window resize events to reposition tooltips
    window.addEventListener('resize', function() {
        const visibleTooltips = document.querySelectorAll('.info-tooltip .tooltip-text[style*="visibility: visible"]');
        visibleTooltips.forEach(tooltipText => {
            positionTooltip(tooltipText);
        });
    });
});