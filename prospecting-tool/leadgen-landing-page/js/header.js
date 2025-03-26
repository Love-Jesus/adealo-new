// Header Interactions
// Handles header animations, sticky navigation, and mobile menu

class Header {
  constructor() {
    // Navigation elements
    this.navbar = document.querySelector('.navbar');
    this.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    this.mobileNav = document.querySelector('.mobile-nav');
    this.mobileNavClose = document.querySelector('.mobile-nav-close');
    this.mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    
    // Text reveal elements
    this.revealElements = document.querySelectorAll('.text-reveal');
    
    this.init();
  }

  init() {
    this.setupStickyNav();
    this.setupMobileMenu();
    this.setupTextReveal();
  }

  setupStickyNav() {
    let lastScroll = 0;
    const scrollThreshold = 100;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > scrollThreshold) {
        this.navbar.classList.add('sticky');
        
        // Hide on scroll down, show on scroll up
        if (currentScroll > lastScroll) {
          this.navbar.style.transform = 'translateY(-100%)';
        } else {
          this.navbar.style.transform = 'translateY(0)';
        }
      } else {
        this.navbar.classList.remove('sticky');
        this.navbar.style.transform = 'translateY(0)';
      }
      
      lastScroll = currentScroll;
    });
  }

  setupMobileMenu() {
    // Toggle menu
    this.mobileMenuToggle.addEventListener('click', () => {
      this.toggleMobileMenu(true);
    });

    // Close menu
    this.mobileNavClose.addEventListener('click', () => {
      this.toggleMobileMenu(false);
    });

    // Close on overlay click
    this.mobileNavOverlay.addEventListener('click', () => {
      this.toggleMobileMenu(false);
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.toggleMobileMenu(false);
      }
    });

    // Handle mobile menu links
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.toggleMobileMenu(false);
      });
    });
  }

  toggleMobileMenu(show) {
    if (show) {
      this.mobileNav.classList.add('active');
      this.mobileNavOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      this.mobileNav.classList.remove('active');
      this.mobileNavOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  setupTextReveal() {
    // Intersection Observer for text reveal animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all text reveal elements
    this.revealElements.forEach(element => {
      observer.observe(element);
    });
  }
}

// Initialize header when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Header();
});
