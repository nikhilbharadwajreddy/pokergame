// Admin Dashboard JavaScript

// Function to initialize charts and visualizations
function initAdminDashboard() {
    // Setup event listeners for admin actions
    setupAdminEventListeners();
}

// Setup event listeners for admin actions
function setupAdminEventListeners() {
    // User search functionality
    const searchInput = document.getElementById('userSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const userRows = document.querySelectorAll('.user-table-row');
            
            userRows.forEach(row => {
                const userId = row.querySelector('.user-id').textContent.toLowerCase();
                if (userId.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    

    
    // Global settings save action
    const globalSettingsForm = document.getElementById('globalSettingsForm');
    if (globalSettingsForm) {
        globalSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Create form data
            const formData = new FormData(this);
            
            // Send AJAX request
            fetch('/admin/update_global_settings', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // Show success message
                const successAlert = document.createElement('div');
                successAlert.className = 'alert alert-success alert-dismissible fade show';
                successAlert.innerHTML = `
                    <i class="bi bi-check-circle"></i> ${data.message || 'Settings saved successfully!'}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                `;
                
                // Insert alert before the form
                globalSettingsForm.parentNode.insertBefore(successAlert, globalSettingsForm);
                
                // Auto-dismiss after 5 seconds
                setTimeout(() => {
                    successAlert.remove();
                }, 5000);
            })
            .catch(error => {
                console.error('Error saving settings:', error);
                
                // Show error message
                const errorAlert = document.createElement('div');
                errorAlert.className = 'alert alert-danger alert-dismissible fade show';
                errorAlert.innerHTML = `
                    <i class="bi bi-exclamation-triangle"></i> Error saving settings. Please try again.
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                `;
                
                // Insert alert before the form
                globalSettingsForm.parentNode.insertBefore(errorAlert, globalSettingsForm);
            });
        });
    }
}

// Initialize admin dashboard on page load
document.addEventListener('DOMContentLoaded', initAdminDashboard);
