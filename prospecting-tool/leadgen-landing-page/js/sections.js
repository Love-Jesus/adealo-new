// Section Animations and Interactions
// Handles journey path animation, metrics counter, and testimonials slider

class Sections {
  constructor() {
    this.initJourneyPath();
    this.initMetricsCounter();
    this.initTestimonialsSlider();
    this.setupScrollAnimations();
    this.initDashboardViews();
  }

  initJourneyPath() {
    const journeySteps = document.querySelectorAll('.journey-step');
    const journeySection = document.querySelector('.journey-section');

    if (!journeySteps.length) return;
    
    // Use GSAP for animations if available
    const useGsap = typeof gsap !== 'undefined';
    
    if (useGsap) {
      // Initialize ScrollTrigger if available
      const hasScrollTrigger = typeof ScrollTrigger !== 'undefined';
      
      // Create a master timeline for the journey animation
      const masterTl = gsap.timeline({
        scrollTrigger: hasScrollTrigger ? {
          trigger: '.journey-section',
          start: 'top 70%',
          end: 'bottom 70%',
          toggleActions: 'play none none reset'
        } : {}
      });
      
      // First, fade in all steps
      masterTl.to(journeySteps, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out"
      });
      
      // Then create the sequential animation
      const sequenceTl = gsap.timeline({
        repeat: -1,
        repeatDelay: 1,
        delay: 0.5
      });
      
      // Animate each step in sequence
      journeySteps.forEach((step, index) => {
        // Create a timeline for each step
        const stepTl = gsap.timeline();
        
        // Subtle highlight effect
        stepTl.to(step, {
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          boxShadow: '0 6px 20px rgba(67, 97, 238, 0.15), 0 0 0 1px rgba(67, 97, 238, 0.2) inset',
          scale: 1.02,
          y: -3,
          duration: 0.7,
          ease: "power1.inOut"
        });
        
        // Subtle pulse animation for the icon
        stepTl.to(step.querySelector('.step-icon'), {
          boxShadow: '0 0 10px rgba(74, 37, 215, 0.3)',
          scale: 1.05,
          duration: 0.5,
          ease: "power1.inOut"
        }, "<");
        
        // Return to normal state (unless it's the last step)
        if (index < journeySteps.length - 1) {
          stepTl.to(step, {
            backgroundColor: 'rgba(255, 255, 255, 0.65)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.6) inset',
            scale: 1,
            y: 0,
            duration: 0.7,
            ease: "power1.inOut",
            delay: 1.2
          });
          
          stepTl.to(step.querySelector('.step-icon'), {
            boxShadow: '0 4px 15px rgba(74, 37, 215, 0.2)',
            scale: 1,
            duration: 0.5,
            ease: "power1.inOut"
          }, "<");
        }
        
        // Add this step's timeline to the sequence
        sequenceTl.add(stepTl);
      });
      
      // Add the sequence timeline to the master timeline
      masterTl.add(sequenceTl);
      
      // Add subtle hover effects to steps
      journeySteps.forEach((step) => {
        step.addEventListener('mouseenter', () => {
          // Pause the animation when hovering
          sequenceTl.pause();
          
          // Subtle highlight effect
          gsap.to(step, {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            boxShadow: '0 6px 25px rgba(74, 37, 215, 0.15), 0 0 0 1px rgba(74, 37, 215, 0.2) inset',
            scale: 1.03,
            y: -4,
            duration: 0.4,
            ease: "power1.out"
          });
          
          // Subtle icon animation
          gsap.to(step.querySelector('.step-icon'), {
            boxShadow: '0 0 12px rgba(74, 37, 215, 0.3)',
            scale: 1.05,
            duration: 0.4,
            ease: "power1.out"
          });
        });
        
        step.addEventListener('mouseleave', () => {
          // Resume the animation when not hovering
          sequenceTl.resume();
          
          // Reset the step
          gsap.to(step, {
            backgroundColor: 'rgba(255, 255, 255, 0.65)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.6) inset',
            scale: 1,
            y: 0,
            duration: 0.4,
            ease: "power1.out"
          });
          
          // Reset the icon
          gsap.to(step.querySelector('.step-icon'), {
            boxShadow: '0 4px 15px rgba(74, 37, 215, 0.2)',
            scale: 1,
            duration: 0.4,
            ease: "power1.out"
          });
        });
      });
    } else {
      // Fallback for when GSAP is not available
      // Simple CSS-based animation
      journeySteps.forEach((step, index) => {
        // Add fade-in-up class with delay
        setTimeout(() => {
          step.classList.add('fade-in-up');
        }, 300 + (index * 200));
        
        // Add active class sequentially
        setInterval(() => {
          // Remove active class from all steps
          journeySteps.forEach(s => s.classList.remove('active'));
          
          // Add active class to current step
          const currentIndex = Math.floor((Date.now() / 2000) % journeySteps.length);
          journeySteps[currentIndex].classList.add('active');
        }, 500);
      });
    }
  }

  animateParticle(particle, index) {
    const path = document.querySelector('.journey-line');
    if (!path) return;

    // Make sure the path has a getTotalLength method (SVG path element)
    if (!path.getTotalLength) return;

    const length = path.getTotalLength();
    const useGsap = typeof gsap !== 'undefined';
    
    if (useGsap) {
      // Set initial position at the start of the path
      const point = path.getPointAtLength(0);
      gsap.set(particle, {
        attr: { cx: point.x, cy: point.y },
        opacity: 0
      });
      
      // Create timeline for particle animation
      const tl = gsap.timeline({
        delay: index * 1,
        repeat: -1,
        repeatDelay: 1
      });
      
      // Fade in the particle
      tl.to(particle, {
        opacity: 0.8,
        duration: 0.3
      });
      
      // Animate along the path
      tl.to(particle, {
        motionPath: {
          path: path,
          align: path,
          alignOrigin: [0.5, 0.5]
        },
        duration: 4,
        ease: "none"
      }, "-=0.3");
      
      // Fade out at the end
      tl.to(particle, {
        opacity: 0,
        duration: 0.3
      }, "-=0.5");
    } else {
      // Fallback animation for when GSAP is not available
      let progress = 0;
      let lastTime = null;

      const animate = (currentTime) => {
        if (!lastTime) lastTime = currentTime;
        const delta = (currentTime - lastTime) / 1000;
        
        progress += delta * 0.1; // Speed factor
        
        if (progress > 1) {
          progress = 0;
          particle.style.opacity = '0';
        }

        const point = path.getPointAtLength(progress * length);
        particle.setAttribute('cx', point.x);
        particle.setAttribute('cy', point.y);
        
        if (progress > 0.1) {
          particle.classList.add('active');
        }

        lastTime = currentTime;
        requestAnimationFrame(animate);
      };

      setTimeout(() => {
        requestAnimationFrame(animate);
      }, index * 2000);
    }
  }

  initMetricsCounter() {
    const counters = document.querySelectorAll('.counter');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = parseInt(entry.target.getAttribute('data-target'));
            this.animateCounter(entry.target, target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(counter => observer.observe(counter));
  }

  animateCounter(element, target) {
    let current = 0;
    const increment = target / 50; // Divide animation into 50 steps
    const duration = 2000; // 2 seconds
    const stepTime = duration / 50;

    const updateCounter = () => {
      current += increment;
      if (current > target) current = target;
      element.textContent = Math.round(current);

      if (current < target) {
        setTimeout(updateCounter, stepTime);
      }
    };

    updateCounter();
  }

  initTestimonialsSlider() {
    const carousel = document.querySelector('.testimonials-carousel');
    const slides = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.testimonial-dot');
    const prevButton = document.querySelector('.testimonial-arrow.prev');
    const nextButton = document.querySelector('.testimonial-arrow.next');

    if (!carousel || !slides.length) return;

    let currentSlide = 0;
    const totalSlides = slides.length;
    let autoplayInterval;
    let isHovering = false;

    // Set initial active state
    slides[currentSlide].classList.add('active');
    
    // Calculate slide width based on viewport
    const calculateSlideWidth = () => {
      if (window.innerWidth >= 992) {
        // Desktop: show 3 slides
        return carousel.offsetWidth / 3;
      } else {
        // Mobile: show 1 slide
        return carousel.offsetWidth;
      }
    };

    // Update slide position
    const updateSlide = (index) => {
      // Remove active class from all slides
      slides.forEach(slide => slide.classList.remove('active'));
      
      // Add active class to current slide
      slides[index].classList.add('active');
      
      // Update dots
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
      
      // Calculate scroll position
      let scrollPos;
      if (window.innerWidth >= 992) {
        // Desktop: center the current slide
        const slideWidth = calculateSlideWidth();
        scrollPos = index * slideWidth - (carousel.offsetWidth - slideWidth) / 2;
      } else {
        // Mobile: full width slides
        scrollPos = index * carousel.offsetWidth;
      }
      
      // Scroll to position
      carousel.scrollTo({
        left: scrollPos,
        behavior: 'smooth'
      });
      
      currentSlide = index;
    };

    // Event listeners
    prevButton?.addEventListener('click', () => {
      const index = (currentSlide - 1 + totalSlides) % totalSlides;
      updateSlide(index);
    });

    nextButton?.addEventListener('click', () => {
      const index = (currentSlide + 1) % totalSlides;
      updateSlide(index);
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => updateSlide(index));
    });

    // Pause autoplay on hover
    carousel.addEventListener('mouseenter', () => {
      isHovering = true;
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
      }
    });

    carousel.addEventListener('mouseleave', () => {
      isHovering = false;
      startAutoplay();
    });

    // Handle keyboard navigation
    document.addEventListener('keydown', (e) => {
      // Only handle keyboard events when testimonials section is in viewport
      const section = document.querySelector('.testimonials-section');
      const rect = section.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom >= 0;
      
      if (!isInViewport) return;
      
      if (e.key === 'ArrowLeft') {
        const index = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSlide(index);
      } else if (e.key === 'ArrowRight') {
        const index = (currentSlide + 1) % totalSlides;
        updateSlide(index);
      }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      // Recalculate and update position after resize
      updateSlide(currentSlide);
    });

    // Start autoplay
    const startAutoplay = () => {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
      }
      
      autoplayInterval = setInterval(() => {
        if (!isHovering) {
          const index = (currentSlide + 1) % totalSlides;
          updateSlide(index);
        }
      }, 5000);
    };

    startAutoplay();
    
    // Initial update
    updateSlide(currentSlide);
  }

  setupScrollAnimations() {
    const elements = document.querySelectorAll('[data-aos]');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            
            // Add delay if specified
            const delay = entry.target.getAttribute('data-aos-delay');
            if (delay) {
              entry.target.style.transitionDelay = `${delay}ms`;
            }
            
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    elements.forEach(element => observer.observe(element));
  }

  initDashboardViews() {
    const dashboardNavBtns = document.querySelectorAll('.dashboard-nav-btn');
    const dashboardViews = document.querySelectorAll('.dashboard-view');
    
    if (!dashboardNavBtns.length || !dashboardViews.length) return;
    
    // Function to switch between dashboard views
    const switchView = (viewId) => {
      // Hide all views
      dashboardViews.forEach(view => {
        view.classList.remove('active');
      });
      
      // Show selected view
      const targetView = document.getElementById(viewId);
      if (targetView) {
        targetView.classList.add('active');
      }
      
      // Update active button state
      dashboardNavBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === viewId.replace('-view', ''));
      });
      
      // If switching to booking view, animate the activity feed
      if (viewId === 'booking-view') {
        this.animateActivityFeed();
      }
      
      // If switching to support view, animate the typing indicator
      if (viewId === 'support-view') {
        this.animateChatTyping();
      }
    };
    
    // Add click event listeners to dashboard nav buttons
    dashboardNavBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const viewId = `${btn.getAttribute('data-view')}-view`;
        switchView(viewId);
      });
    });
    
    // Set initial active view
    const initialView = 'prospecting-view';
    switchView(initialView);
    
    // Auto-rotate views every 8 seconds for demo purposes
    let currentViewIndex = 0;
    const viewIds = ['prospecting-view', 'booking-view', 'support-view'];
    
    setInterval(() => {
      currentViewIndex = (currentViewIndex + 1) % viewIds.length;
      switchView(viewIds[currentViewIndex]);
      
      // Update active button
      dashboardNavBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === viewIds[currentViewIndex].replace('-view', ''));
      });
    }, 8000);
  }
  
  animateActivityFeed() {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;
    
    // New activity data
    const newActivities = [
      {
        icon: 'fa-eye',
        text: '<span class="highlight">Acme Corporation</span> viewed your pricing page',
        time: 'Just now'
      },
      {
        icon: 'fa-download',
        text: '<span class="highlight">Jane Smith (TechCorp)</span> downloaded your whitepaper',
        time: '5 minutes ago'
      }
    ];
    
    // Function to create a new activity item
    const createActivityItem = (activity) => {
      const item = document.createElement('div');
      item.className = 'activity-item new-activity';
      item.innerHTML = `
        <div class="activity-icon">
          <i class="fas ${activity.icon}"></i>
        </div>
        <div class="activity-content">
          <div class="activity-text">${activity.text}</div>
          <div class="activity-time">${activity.time}</div>
        </div>
      `;
      return item;
    };
    
    // Add animation for new activities
    let delay = 2000; // Initial delay
    
    // Add new activity items with delay
    newActivities.forEach((activity, index) => {
      setTimeout(() => {
        // Create and add the new activity
        const newItem = createActivityItem(activity);
        newItem.style.opacity = '0';
        newItem.style.transform = 'translateY(-10px)';
        activityList.prepend(newItem);
        
        // Animate in
        setTimeout(() => {
          newItem.style.transition = 'all 0.5s ease';
          newItem.style.opacity = '1';
          newItem.style.transform = 'translateY(0)';
        }, 50);
        
        // Remove the last item if there are more than 3
        const items = activityList.querySelectorAll('.activity-item');
        if (items.length > 3) {
          const lastItem = items[items.length - 1];
          lastItem.style.transition = 'all 0.5s ease';
          lastItem.style.opacity = '0';
          lastItem.style.transform = 'translateY(10px)';
          
          setTimeout(() => {
            lastItem.remove();
          }, 500);
        }
      }, delay + (index * 3000));
    });
  }
  
  animateChatTyping() {
    const chatMessages = document.querySelector('.chat-messages');
    const typingIndicator = document.querySelector('.chat-message.typing');
    
    if (!chatMessages || !typingIndicator) return;
    
    // After 3 seconds, add a new message and remove typing indicator
    setTimeout(() => {
      // Hide typing indicator
      typingIndicator.style.display = 'none';
      
      // Create new message
      const newMessage = document.createElement('div');
      newMessage.className = 'chat-message outgoing';
      newMessage.innerHTML = `
        <div class="chat-bubble">I can help with that. Which CRM are you using? Most common integration issues are related to API keys or permissions.</div>
        <div class="chat-time">10:47 AM</div>
      `;
      
      // Add to chat
      chatMessages.appendChild(newMessage);
      
      // Animate in
      newMessage.style.opacity = '0';
      newMessage.style.transform = 'translateY(10px)';
      
      setTimeout(() => {
        newMessage.style.transition = 'all 0.5s ease';
        newMessage.style.opacity = '1';
        newMessage.style.transform = 'translateY(0)';
      }, 50);
    }, 3000);
  }
}

// Initialize sections when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Sections();
});
