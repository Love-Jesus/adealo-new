/**
 * Dashboard functionality for ProspectIQ
 * Handles view switching and automatic rotation
 */

document.addEventListener('DOMContentLoaded', function() {
    // Dashboard elements
    const dashboardTabs = document.querySelectorAll('.dashboard-tab');
    const dashboardViews = document.querySelectorAll('.dashboard-view');
    const sidebarIcons = document.querySelectorAll('.sidebar-icon');
    
    // Auto-rotation settings
    const rotationInterval = 6000; // 6 seconds between view changes
    let currentViewIndex = 0;
    let rotationTimer;
    let isHovering = false;
    
    // Initialize
    startViewRotation();
    
    // Dashboard hover detection - pause rotation when hovering
    const dashboardFrame = document.querySelector('.dashboard-frame');
    if (dashboardFrame) {
        dashboardFrame.addEventListener('mouseenter', function() {
            isHovering = true;
            stopViewRotation();
        });
        
        dashboardFrame.addEventListener('mouseleave', function() {
            isHovering = false;
            startViewRotation();
        });
    }
    
    // Tab click handlers
    dashboardTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetView = this.getAttribute('data-view');
            switchToView(targetView);
            resetRotationTimer();
        });
    });
    
    // Functions
    function switchToView(viewId) {
        // Update tabs
        dashboardTabs.forEach(tab => {
            if (tab.getAttribute('data-view') === viewId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Update views
        dashboardViews.forEach(view => {
            if (view.id === viewId) {
                view.classList.add('active');
                
                // Update sidebar icons to match the current view
                const viewIndex = Array.from(dashboardViews).indexOf(view);
                updateSidebarIcons(viewIndex);
            } else {
                view.classList.remove('active');
            }
        });
    }
    
    // No longer need to update sidebar icons since they've been removed
    function updateSidebarIcons(activeIndex) {
        // Function kept for compatibility but no longer does anything
    }
    
    function rotateView() {
        if (isHovering) return;
        
        currentViewIndex = (currentViewIndex + 1) % 3; // 3 views: prospecting, booking, support
        const viewIds = ['prospecting-view', 'booking-view', 'support-view'];
        switchToView(viewIds[currentViewIndex]);
    }
    
    function startViewRotation() {
        rotationTimer = setInterval(rotateView, rotationInterval);
    }
    
    function stopViewRotation() {
        clearInterval(rotationTimer);
    }
    
    function resetRotationTimer() {
        stopViewRotation();
        if (!isHovering) {
            startViewRotation();
        }
    }
    
    // Add a new activity animation
    function animateNewActivity() {
        const activityItems = document.querySelectorAll('.activity-item');
        if (activityItems.length > 0) {
            // Randomly select an activity item to highlight
            const randomIndex = Math.floor(Math.random() * activityItems.length);
            const item = activityItems[randomIndex];
            
            // Add the new activity class
            item.classList.add('new-activity');
            
            // Remove the class after animation completes
            setTimeout(() => {
                item.classList.remove('new-activity');
            }, 3000);
        }
    }
    
    // Periodically animate a new activity when in the activity view
    setInterval(() => {
        if (document.getElementById('booking-view').classList.contains('active')) {
            animateNewActivity();
        }
    }, 5000);
});
