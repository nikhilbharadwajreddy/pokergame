// Minimal fix script that won't slow down the app
document.addEventListener('DOMContentLoaded', function() {
    // Hide any settlement sections that might be visible
    const sections = document.querySelectorAll('#settlementResults, .settlement-section');
    sections.forEach(section => {
        if (section) section.style.display = 'none';
    });
    
    // Make sure donation links are yellow
    const donationLinks = document.querySelectorAll('.settlement-credit a');
    donationLinks.forEach(link => {
        if (link) link.style.color = '#FFCC00';
    });
});
