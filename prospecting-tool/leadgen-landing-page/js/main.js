// Main Application
// Initializes components and handles global functionality

class App {
  constructor() {
    this.preloader = document.querySelector('.preloader');
    this.init();
  }

  init() {
    // Handle preloader
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.preloader.classList.add('loaded');
        document.body.style.overflow = '';
      }, 1000);
    });

    // Prevent body scroll when preloader is active
    document.body.style.overflow = 'hidden';

    // Handle smooth scrolling for anchor links
    this.setupSmoothScroll();

    // Handle form submissions
    this.setupForms();
  }

  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  setupForms() {
    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = newsletterForm.querySelector('input[type="email"]').value;
        
        // Here you would typically send this to your backend
        // For demo purposes, we'll just show a success message
        const formGroup = newsletterForm.querySelector('.form-group');
        
        // Remove any existing messages
        const existingMessage = formGroup.querySelector('.form-success, .form-error');
        if (existingMessage) {
          existingMessage.remove();
        }
        
        // Add success message
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success';
        successMessage.textContent = 'Thank you for subscribing!';
        formGroup.appendChild(successMessage);
        
        // Reset form
        newsletterForm.reset();
      });
    }

    // Demo booking form (if exists)
    const demoForm = document.querySelector('.demo-form');
    if (demoForm) {
      demoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Here you would typically send this to your backend
        // For demo purposes, we'll just show a success message
        const formGroup = demoForm.querySelector('.form-group');
        
        // Remove any existing messages
        const existingMessage = formGroup.querySelector('.form-success, .form-error');
        if (existingMessage) {
          existingMessage.remove();
        }
        
        // Add success message
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success';
        successMessage.textContent = 'Thank you! We will contact you shortly.';
        formGroup.appendChild(successMessage);
        
        // Reset form
        demoForm.reset();
      });
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
