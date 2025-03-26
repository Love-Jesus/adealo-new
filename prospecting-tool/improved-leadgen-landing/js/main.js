/**
 * Main JavaScript
 * Initializes and coordinates all scripts
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize preloader
  initPreloader();
  
  // Initialize animations
  initAnimations();
  
  // Initialize gradient background
  initGradientBackground();
  
  // Initialize mobile navigation
  initMobileNav();
  
  // Initialize sticky header
  initStickyHeader();
  
  // Initialize journey path animations
  initJourneyPath();
  
  // Initialize network visualization
  initNetworkVisualization();
  
  // Initialize data flow visualization
  initDataFlow();
  
  // Initialize counters
  initCounters();
  
  // Initialize testimonial slider
  initTestimonialSlider();
});

/**
 * Initialize preloader
 */
function initPreloader() {
  const preloader = document.querySelector('.preloader');
  
  // Hide preloader after content is loaded
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('loaded');
      
      // Enable scroll after preloader is hidden
      document.body.style.overflow = 'auto';
      
      // Start animations after preloader is hidden
      startAnimations();
    }, 500);
  });
  
  // Fallback in case load event doesn't fire
  setTimeout(() => {
    if (!preloader.classList.contains('loaded')) {
      preloader.classList.add('loaded');
      document.body.style.overflow = 'auto';
      startAnimations();
    }
  }, 3000);
}

/**
 * Initialize animations
 */
function initAnimations() {
  // Disable animations initially
  document.body.style.overflow = 'hidden';
  
  // Set up scroll-based animations
  setupScrollAnimations();
}

/**
 * Start animations after preloader is hidden
 */
function startAnimations() {
  // Reveal gradient background
  document.getElementById('gradient-canvas').setAttribute('data-transition-in', '');
  
  // Animate hero section elements
  animateHeroSection();
}

/**
 * Animate hero section elements
 */
function animateHeroSection() {
  // Animate text reveals
  const textReveals = document.querySelectorAll('.text-reveal');
  textReveals.forEach((element, index) => {
    element.style.animationDelay = `${index * 0.2}s`;
  });
  
  // Animate hero visual
  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual) {
    heroVisual.classList.add('fade-in');
  }
}

/**
 * Set up scroll-based animations
 */
function setupScrollAnimations() {
  const animatedElements = document.querySelectorAll('[data-aos]');
  
  // Create intersection observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -10% 0px'
  });
  
  // Observe all animated elements
  animatedElements.forEach(element => {
    observer.observe(element);
  });
}

/**
 * Initialize mobile navigation
 */
function initMobileNav() {
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileNavClose = document.querySelector('.mobile-nav-close');
  const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
  
  if (!mobileMenuToggle || !mobileNav) return;
  
  // Open mobile navigation
  mobileMenuToggle.addEventListener('click', () => {
    mobileNav.classList.add('active');
    mobileNavOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
  
  // Close mobile navigation
  const closeNav = () => {
    mobileNav.classList.remove('active');
    mobileNavOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
  };
  
  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', closeNav);
  }
  
  if (mobileNavOverlay) {
    mobileNavOverlay.addEventListener('click', closeNav);
  }
  
  // Close navigation when clicking on a link
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeNav);
  });
}

/**
 * Initialize sticky header
 */
function initStickyHeader() {
  const navbar = document.querySelector('.navbar');
  const header = document.querySelector('.header');
  
  if (!navbar || !header) return;
  
  const headerHeight = header.offsetHeight;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > headerHeight - 100) {
      navbar.classList.add('sticky');
    } else {
      navbar.classList.remove('sticky');
    }
  });
}

/**
 * Initialize journey path animations
 */
function initJourneyPath() {
  const journeySection = document.querySelector('.journey-section');
  const journeyLine = document.querySelector('.journey-line');
  const journeyNodes = document.querySelectorAll('.journey-node');
  const journeyParticles = document.querySelectorAll('.journey-particle');
  const journeySteps = document.querySelectorAll('.journey-step');
  
  if (!journeySection || !journeyLine || !journeyNodes.length) return;
  
  // Create intersection observer
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      // Animate journey line
      journeyLine.classList.add('active');
      
      // Animate journey nodes with delay
      journeyNodes.forEach((node, index) => {
        setTimeout(() => {
          node.classList.add('active');
        }, 500 + (index * 300));
      });
      
      // Animate journey steps with delay
      journeySteps.forEach((step, index) => {
        setTimeout(() => {
          step.classList.add('fade-in-up');
        }, 800 + (index * 300));
      });
      
      // Animate particles after line is drawn
      setTimeout(() => {
        journeyParticles.forEach(particle => {
          particle.classList.add('active');
        });
      }, 1500);
      
      observer.unobserve(journeySection);
    }
  }, {
    threshold: 0.3
  });
  
  observer.observe(journeySection);
}

// Network visualization and data flow are implemented in their respective files
// network.js and dataflow.js

/**
 * Initialize counters
 */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  
  if (!counters.length) return;
  
  counters.forEach(counter => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const step = Math.ceil(target / (duration / 16)); // 60fps
        
        counter.classList.add('active');
        
        let current = 0;
        const timer = setInterval(() => {
          current += step;
          
          if (current >= target) {
            counter.textContent = target;
            clearInterval(timer);
          } else {
            counter.textContent = current;
          }
        }, 16);
        
        observer.unobserve(counter);
      }
    }, {
      threshold: 0.5
    });
    
    observer.observe(counter);
  });
}

/**
 * Initialize testimonial slider
 */
function initTestimonialSlider() {
  const track = document.querySelector('.testimonials-track');
  const cards = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.testimonial-dot');
  const prevButton = document.querySelector('.testimonial-arrow.prev');
  const nextButton = document.querySelector('.testimonial-arrow.next');
  
  if (!track || !cards.length || !dots.length) return;
  
  let currentIndex = 0;
  
  // Show initial card
  cards[0].classList.add('active');
  dots[0].classList.add('active');
  
  // Function to go to a specific slide
  const goToSlide = (index) => {
    // Update current index
    currentIndex = index;
    
    // Update track position
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    // Update active card
    cards.forEach(card => card.classList.remove('active'));
    cards[currentIndex].classList.add('active');
    
    // Update active dot
    dots.forEach(dot => dot.classList.remove('active'));
    dots[currentIndex].classList.add('active');
  };
  
  // Event listeners for dots
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
    });
  });
  
  // Event listeners for arrows
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      const newIndex = (currentIndex - 1 + cards.length) % cards.length;
      goToSlide(newIndex);
    });
  }
  
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      const newIndex = (currentIndex + 1) % cards.length;
      goToSlide(newIndex);
    });
  }
  
  // Auto-advance slides every 5 seconds
  setInterval(() => {
    const newIndex = (currentIndex + 1) % cards.length;
    goToSlide(newIndex);
  }, 5000);
}
