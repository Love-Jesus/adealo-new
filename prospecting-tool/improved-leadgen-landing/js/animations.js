/**
 * Animations
 * Handles general animations throughout the site
 */

// Initialize animations
function initAnimations() {
  // Disable animations initially
  document.body.style.overflow = 'hidden';
  
  // Set up scroll-based animations
  setupScrollAnimations();
  
  // Set up text reveal animations
  setupTextRevealAnimations();
  
  // Set up counter animations
  setupCounterAnimations();
  
  // Set up hover animations
  setupHoverAnimations();
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
  const textReveals = document.querySelectorAll('.hero .text-reveal');
  textReveals.forEach((element, index) => {
    element.style.animationDelay = `${index * 0.2}s`;
  });
  
  // Animate hero visual
  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual) {
    heroVisual.classList.add('fade-in');
  }
  
  // Animate hero CTA
  const heroCta = document.querySelector('.hero-cta');
  if (heroCta) {
    setTimeout(() => {
      heroCta.classList.add('fade-in-up');
    }, 800);
  }
  
  // Animate header shapes
  const headerShapes = document.querySelectorAll('.header-shapes .shape');
  headerShapes.forEach((shape, index) => {
    setTimeout(() => {
      shape.style.opacity = '1';
    }, 1000 + (index * 200));
  });
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
 * Set up text reveal animations
 */
function setupTextRevealAnimations() {
  const textReveals = document.querySelectorAll('.text-reveal:not(.hero .text-reveal)');
  
  // Create intersection observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        entry.target.style.animationDelay = `${index * 0.1}s`;
        entry.target.classList.add('animate');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -10% 0px'
  });
  
  // Observe all text reveal elements
  textReveals.forEach(element => {
    observer.observe(element);
  });
}

/**
 * Set up counter animations
 */
function setupCounterAnimations() {
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
 * Set up hover animations
 */
function setupHoverAnimations() {
  // Feature cards hover effect
  const featureCards = document.querySelectorAll('.feature-card');
  
  featureCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.classList.add('hover');
    });
    
    card.addEventListener('mouseleave', () => {
      card.classList.remove('hover');
    });
  });
  
  // Button hover effect
  const buttons = document.querySelectorAll('.btn');
  
  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      button.classList.add('hover');
    });
    
    button.addEventListener('mouseleave', () => {
      button.classList.remove('hover');
    });
  });
}

/**
 * Add CSS for hover animations
 */
function addHoverAnimationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .feature-card.hover {
      transform: translateY(-10px);
    }
    
    .feature-card.hover::before {
      transform: scaleX(1);
    }
    
    .btn.hover {
      transform: translateY(-2px);
    }
    
    .btn-primary.hover {
      box-shadow: var(--shadow-lg);
    }
    
    .btn-secondary.hover {
      background: rgba(67, 97, 238, 0.1);
    }
    
    .btn-text.hover i {
      transform: translateX(4px);
    }
    
    .btn-text.hover::after {
      width: 100%;
    }
    
    .text-reveal.animate::after {
      animation: text-reveal 1.2s var(--transition-normal) forwards;
    }
  `;
  
  document.head.appendChild(style);
}

/**
 * Add parallax effect to elements
 */
function setupParallaxEffect() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  
  if (!parallaxElements.length) return;
  
  // Update parallax positions on scroll
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    parallaxElements.forEach(element => {
      const speed = parseFloat(element.getAttribute('data-parallax')) || 0.1;
      const offsetY = scrollY * speed;
      
      element.style.transform = `translateY(${offsetY}px)`;
    });
  });
}

/**
 * Add smooth scrolling to anchor links
 */
function setupSmoothScrolling() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY;
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Add hover animation styles when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  addHoverAnimationStyles();
  setupParallaxEffect();
  setupSmoothScrolling();
});
