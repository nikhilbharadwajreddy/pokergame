// Handle collapsible sections
document.addEventListener('DOMContentLoaded', function() {
    // Set up collapsible sections
    const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
    
    collapsibleHeaders.forEach(header => {
        header.addEventListener('click', function() {
            // Get the content associated with this header
            const content = this.nextElementSibling;
            
            // Toggle the collapsed class
            content.classList.toggle('collapsed');
            
            // Find the collapse icon within the header
            const icon = this.querySelector('.collapse-icon');
            if (icon) {
                icon.classList.toggle('rotated');
            }
            
            // Set max-height to either 0 or the scroll height
            if (content.classList.contains('collapsed')) {
                content.style.maxHeight = '0';
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
        
        // Initialize the sections to be expanded by default
        const content = header.nextElementSibling;
        if (!content.classList.contains('collapsed')) {
            content.style.maxHeight = content.scrollHeight + 'px';
        } else {
            content.style.maxHeight = '0';
        }
    });
    
    // Prevent info icons from triggering collapse when clicked
    document.querySelectorAll('.info-icon').forEach(icon => {
        icon.addEventListener('click', function(event) {
            // Stop the event from bubbling up to parent elements
            event.stopPropagation();
        });
    });
});