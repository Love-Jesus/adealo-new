document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const screens = document.querySelectorAll('.screen');
    const progressIndicator = document.getElementById('progress-indicator');
    const progressSteps = document.querySelectorAll('.progress-step');
    const radioOptions = document.querySelectorAll('.radio-option');
    const customRoleContainer = document.getElementById('custom-role-container');
    const customRoleInput = document.getElementById('custom-role');
    const visualizations = document.querySelectorAll('.visualization');
    
    // Navigation buttons
    const continueToScreen2 = document.getElementById('continue-to-2');
    const continueToScreen3 = document.getElementById('continue-to-3');
    const finishOnboarding = document.getElementById('finish-onboarding');
    const backToScreen1 = document.getElementById('back-to-1');
    const backToScreen2 = document.getElementById('back-to-2');
    const skipInvites = document.getElementById('skip-invites');
    const goToDashboard = document.getElementById('go-to-dashboard');
    
    // Email inputs
    const emailInputs = document.getElementById('email-inputs');
    const addEmailBtn = document.getElementById('add-email-btn');
    
    // Visualization elements
    const roleVisualization = document.getElementById('role-visualization');
    const goalsVisualization = document.getElementById('goals-visualization');
    const teamVisualization = document.getElementById('team-visualization');
    const orbitItems = document.querySelectorAll('.orbit-item');
    const goalIcons = document.querySelectorAll('.goal-icon');
    const teamMembers = document.getElementById('team-members');
    
    // Current screen tracking
    let currentScreen = 1;
    
    // Initialize
    showScreen(currentScreen);
    updateProgress();
    showVisualization(currentScreen);
    positionOrbitItems();
    
    // Show specific screen
    function showScreen(screenNumber) {
        screens.forEach((screen) => {
            screen.classList.remove('active');
        });
        
        document.getElementById(`screen-${screenNumber}`).classList.add('active');
        currentScreen = screenNumber;
        updateProgress();
        showVisualization(screenNumber);
    }
    
    // Show corresponding visualization
    function showVisualization(screenNumber) {
        visualizations.forEach((vis) => {
            vis.classList.remove('active');
        });
        
        if (screenNumber === 1) {
            roleVisualization.classList.add('active');
        } else if (screenNumber === 2) {
            goalsVisualization.classList.add('active');
        } else if (screenNumber === 3) {
            teamVisualization.classList.add('active');
        }
    }
    
    // Position orbit items in a circle
    function positionOrbitItems() {
        orbitItems.forEach((item, index) => {
            const totalItems = orbitItems.length;
            const angle = (index / totalItems) * 2 * Math.PI;
            const radius = 140; // Radius of the orbit
            
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            item.style.transform = `translate(${x}px, ${y}px)`;
            
            // Add animation delay based on position
            item.style.animationDelay = `${index * 0.1}s`;
        });
    }
    
    // Update progress bar and steps
    function updateProgress() {
        const totalScreens = 4; // Including completion screen
        const progressPercentage = (currentScreen / totalScreens) * 100;
        progressIndicator.style.width = `${progressPercentage}%`;
        
        // Update progress steps
        progressSteps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            
            if (index + 1 === currentScreen) {
                step.classList.add('active');
            } else if (index + 1 < currentScreen) {
                step.classList.add('completed');
            }
        });
    }
    
    // Create ripple effect on button click
    function createRipple(event) {
        const button = event.currentTarget;
        
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
        circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
        circle.classList.add('ripple');
        
        const ripple = button.querySelector('.ripple');
        if (ripple) {
            ripple.remove();
        }
        
        button.appendChild(circle);
        
        // Remove the ripple after animation completes
        setTimeout(() => {
            circle.remove();
        }, 600);
    }
    
    // Create confetti animation
    function createConfetti() {
        const container = document.querySelector('.onboarding-container');
        const confettiCount = 100;
        const colors = ['#6366f1', '#f59e0b', '#4CAF50', '#9C27B0', '#FF5722'];
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            
            // Random properties
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.width = `${Math.random() * 10 + 5}px`;
            confetti.style.height = `${Math.random() * 10 + 5}px`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.opacity = Math.random() * 0.8 + 0.2;
            
            // Random rotation and movement
            const duration = Math.random() * 3 + 2;
            const rotation = Math.random() * 360;
            confetti.style.animation = `confetti-fall ${duration}s linear forwards`;
            confetti.style.transform = `rotate(${rotation}deg)`;
            
            container.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                confetti.remove();
            }, duration * 1000);
        }
    }
    
    // Navigate to next screen with animation
    function goToNextScreen() {
        const currentScreenElement = document.getElementById(`screen-${currentScreen}`);
        const nextScreenElement = document.getElementById(`screen-${currentScreen + 1}`);
        
        if (currentScreenElement && nextScreenElement) {
            currentScreenElement.classList.add('slide-out-left');
            
            setTimeout(() => {
                currentScreenElement.classList.remove('active', 'slide-out-left');
                nextScreenElement.classList.add('active', 'slide-in-right');
                
                setTimeout(() => {
                    nextScreenElement.classList.remove('slide-in-right');
                }, 300);
                
                currentScreen++;
                updateProgress();
                showVisualization(currentScreen);
                
                // If reaching the completion screen, trigger confetti
                if (currentScreen === 4) {
                    createConfetti();
                }
            }, 300);
        }
    }
    
    // Navigate to previous screen with animation
    function goToPreviousScreen() {
        const currentScreenElement = document.getElementById(`screen-${currentScreen}`);
        const prevScreenElement = document.getElementById(`screen-${currentScreen - 1}`);
        
        if (currentScreenElement && prevScreenElement) {
            currentScreenElement.classList.add('slide-out-right');
            
            setTimeout(() => {
                currentScreenElement.classList.remove('active', 'slide-out-right');
                prevScreenElement.classList.add('active', 'slide-in-left');
                
                setTimeout(() => {
                    prevScreenElement.classList.remove('slide-in-left');
                }, 300);
                
                currentScreen--;
                updateProgress();
                showVisualization(currentScreen);
            }, 300);
        }
    }
    
    // Handle role selection with radio buttons
    radioOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Update the radio button state
            const radioInput = this.querySelector('input[type="radio"]');
            radioInput.checked = true;
            
            // Show custom role input if "Other" is selected
            if (this.dataset.role === 'other') {
                customRoleContainer.classList.add('active');
                customRoleInput.focus();
            } else {
                customRoleContainer.classList.remove('active');
            }
            
            // Update visualization
            updateRoleVisualization(this.dataset.role);
        });
    });
    
    // Update role visualization
    function updateRoleVisualization(role) {
        // Reset all orbit items
        orbitItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Activate the selected role
        const selectedOrbitItem = document.querySelector(`.orbit-item[data-role="${role}"]`);
        if (selectedOrbitItem) {
            selectedOrbitItem.classList.add('active');
            
            // Animate the selected item
            if (typeof gsap !== 'undefined') {
                gsap.to(selectedOrbitItem, {
                    scale: 1.3,
                    duration: 0.3,
                    yoyo: true,
                    repeat: 1
                });
            } else {
                // Fallback animation if GSAP is not available
                selectedOrbitItem.style.transition = 'transform 0.3s ease';
                selectedOrbitItem.style.transform = 'translate(' + selectedOrbitItem.style.transform.split('translate')[1] + ') scale(1.3)';
                
                setTimeout(() => {
                    selectedOrbitItem.style.transform = 'translate(' + selectedOrbitItem.style.transform.split('translate')[1].split('scale')[0] + ') scale(1)';
                }, 300);
            }
        }
    }
    
    // Handle goal selection
    document.querySelectorAll('input[name="goal"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateGoalVisualization();
        });
    });
    
    // Update goal visualization
    function updateGoalVisualization() {
        // Reset all goal icons
        goalIcons.forEach(icon => {
            icon.classList.remove('active');
        });
        
        // Activate selected goals
        document.querySelectorAll('input[name="goal"]:checked').forEach(checkbox => {
            const goalValue = checkbox.value;
            const goalIcon = document.querySelector(`.goal-icon[data-goal="${goalValue}"]`);
            
            if (goalIcon) {
                goalIcon.classList.add('active');
                
                // Animate the selected icon
                if (typeof gsap !== 'undefined') {
                    gsap.to(goalIcon, {
                        y: -10,
                        duration: 0.3,
                        yoyo: true,
                        repeat: 1
                    });
                } else {
                    // Fallback animation if GSAP is not available
                    goalIcon.style.transition = 'transform 0.3s ease';
                    goalIcon.style.transform = 'translateY(-10px)';
                    
                    setTimeout(() => {
                        goalIcon.style.transform = 'translateY(0)';
                    }, 300);
                }
            }
        });
    }
    
    // Add new email input
    addEmailBtn.addEventListener('click', function(event) {
        createRipple(event);
        
        const newEmailGroup = document.createElement('div');
        newEmailGroup.className = 'email-input-group';
        newEmailGroup.innerHTML = `
            <input type="email" class="email-input" placeholder="colleague@company.com">
            <button class="remove-email-btn">×</button>
        `;
        
        emailInputs.appendChild(newEmailGroup);
        
        // Focus the new input
        const newInput = newEmailGroup.querySelector('.email-input');
        newInput.focus();
        
        // Add event listener to remove button
        const removeBtn = newEmailGroup.querySelector('.remove-email-btn');
        removeBtn.addEventListener('click', function() {
            newEmailGroup.remove();
            updateTeamVisualization();
        });
        
        // Add event listener to email input
        newInput.addEventListener('input', updateTeamVisualization);
        
        // Update team visualization
        updateTeamVisualization();
    });
    
    // Update team visualization with enhanced animation
    function updateTeamVisualization() {
        // Clear existing team members
        teamMembers.innerHTML = '';
        
        // Get all email inputs with values
        const emails = Array.from(document.querySelectorAll('.email-input'))
            .filter(input => input.value.trim() !== '')
            .map(input => input.value);
        
        // Debug log to check emails
        console.log('Emails found:', emails);
        
        // Create team member elements - ensure each gets a unique position
        emails.forEach((email, index) => {
            const member = document.createElement('div');
            member.className = 'team-member';
            member.id = `team-member-${index}`; // Add unique ID
            
            // Position in a circle - ensure each member gets a unique position
            // Divide the circle evenly based on the number of emails
            const angle = (index / emails.length) * 2 * Math.PI;
            const radius = 120; // Radius of the circle
            
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            // Display initials
            const initials = email.split('@')[0].substring(0, 2).toUpperCase();
            member.textContent = initials;
            
            // Set position immediately to avoid race conditions
            member.style.transform = `translate(${x}px, ${y}px) scale(0.5)`;
            member.style.opacity = '0';
            
            // Add to container immediately
            teamMembers.appendChild(member);
            
            // Trigger animation after a brief delay to ensure the DOM has updated
            setTimeout(() => {
                member.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                member.style.opacity = '1';
                member.style.transform = `translate(${x}px, ${y}px) scale(1)`;
            }, 50 + (index * 150)); // Stagger the animations
        });
        
        // Debug log to check team members
        console.log('Team members created:', teamMembers.children.length);
    }
    
    // Add event listener to initial remove button
    document.querySelector('.remove-email-btn').addEventListener('click', function() {
        const emailGroup = this.parentElement;
        // Don't remove if it's the only one
        if (emailInputs.children.length > 1) {
            emailGroup.remove();
        } else {
            // Clear the input instead
            emailGroup.querySelector('.email-input').value = '';
        }
        updateTeamVisualization();
    });
    
    // Add event listener to initial email input
    document.querySelector('.email-input').addEventListener('input', updateTeamVisualization);
    
    // Add ripple effect to all buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', createRipple);
    });
    
    // Navigation button event listeners
    continueToScreen2.addEventListener('click', function() {
        // Validate role selection
        const selectedRole = document.querySelector('input[name="role"]:checked');
        
        if (!selectedRole) {
            alert('Please select a role to continue.');
            return;
        }
        
        // If "Other" is selected, validate custom role input
        if (selectedRole.value === 'other' && !customRoleInput.value.trim()) {
            alert('Please enter your role to continue.');
            customRoleInput.focus();
            return;
        }
        
        goToNextScreen();
    });
    
    // Fix the continue button ID for screen 2
    if (document.getElementById('continue-to-3')) {
        document.getElementById('continue-to-3').addEventListener('click', function() {
            // Validate at least one goal is selected
            const selectedGoals = document.querySelectorAll('input[name="goal"]:checked');
            
            if (selectedGoals.length === 0) {
                alert('Please select at least one goal to continue.');
                return;
            }
            
            goToNextScreen();
        });
    }
    
    finishOnboarding.addEventListener('click', function() {
        // Validate email format if any are entered
        const emailInputElements = document.querySelectorAll('.email-input');
        let allValid = true;
        
        emailInputElements.forEach(input => {
            const email = input.value.trim();
            if (email && !isValidEmail(email)) {
                allValid = false;
                input.style.borderColor = 'red';
            } else {
                input.style.borderColor = '';
            }
        });
        
        if (!allValid) {
            alert('Please enter valid email addresses.');
            return;
        }
        
        goToNextScreen();
    });
    
    skipInvites.addEventListener('click', function() {
        goToNextScreen();
    });
    
    backToScreen1.addEventListener('click', function() {
        goToPreviousScreen();
    });
    
    backToScreen2.addEventListener('click', function() {
        goToPreviousScreen();
    });
    
    goToDashboard.addEventListener('click', function() {
        // Redirect to dashboard or complete the onboarding
        alert('Onboarding complete! Redirecting to dashboard...');
        // In a real application, you would redirect to the dashboard
        // window.location.href = '/dashboard';
    });
    
    // Add click event listeners to goal icons
    goalIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const goalValue = this.dataset.goal;
            const checkbox = document.querySelector(`input[name="goal"][value="${goalValue}"]`);
            
            if (checkbox) {
                checkbox.checked = !checkbox.checked;
                updateGoalVisualization();
            }
        });
    });
    
    // Helper function to validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});
