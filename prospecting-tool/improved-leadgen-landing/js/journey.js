/**
 * Journey Path Animations
 * Handles the animated journey path in the journey section
 */

// Initialize journey path animations
function initJourneyPath() {
  const journeySection = document.querySelector('.journey-section');
  const journeyLine = document.querySelector('.journey-line');
  const journeyNodes = document.querySelectorAll('.journey-node');
  const journeyParticles = document.querySelectorAll('.journey-particle');
  const journeySteps = document.querySelectorAll('.journey-step');
  
  if (!journeySection || !journeyLine || !journeyNodes.length) return;
  
  // Set up particles for motion along the path
  setupParticlesMotion(journeyParticles, journeyLine);
  
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
  
  // Add hover effects to journey steps
  addJourneyStepHoverEffects(journeySteps, journeyNodes);
}

/**
 * Set up particles for motion along the path
 * @param {NodeList} particles - Journey particles
 * @param {Element} path - Journey path
 */
function setupParticlesMotion(particles, path) {
  if (!particles.length || !path) return;
  
  // Get path length
  const pathLength = path.getTotalLength();
  
  // Set up particles
  particles.forEach((particle, index) => {
    // Set initial position
    const offset = index * (pathLength / particles.length);
    
    // Create animation
    const animation = document.createElement('style');
    animation.textContent = `
      @keyframes moveAlongPath${index} {
        0% {
          offset-distance: ${offset}px;
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% {
          offset-distance: ${offset + pathLength}px;
          opacity: 0;
        }
      }
      
      .journey-particle:nth-child(${index + 3}).active {
        offset-path: path('${path.getAttribute('d')}');
        animation: moveAlongPath${index} ${3 + index * 0.5}s linear infinite;
        animation-delay: ${index * 0.5}s;
      }
    `;
    
    document.head.appendChild(animation);
  });
}

/**
 * Add hover effects to journey steps
 * @param {NodeList} steps - Journey steps
 * @param {NodeList} nodes - Journey nodes
 */
function addJourneyStepHoverEffects(steps, nodes) {
  if (!steps.length || !nodes.length) return;
  
  steps.forEach((step, index) => {
    const node = nodes[index];
    
    if (!node) return;
    
    // Highlight step and node on hover
    step.addEventListener('mouseenter', () => {
      step.classList.add('highlight');
      node.classList.add('highlight');
    });
    
    step.addEventListener('mouseleave', () => {
      step.classList.remove('highlight');
      node.classList.remove('highlight');
    });
    
    // Highlight node and step on node hover
    node.addEventListener('mouseenter', () => {
      step.classList.add('highlight');
      node.classList.add('highlight');
    });
    
    node.addEventListener('mouseleave', () => {
      step.classList.remove('highlight');
      node.classList.remove('highlight');
    });
  });
}

/**
 * Add CSS for journey step highlight
 */
function addJourneyHighlightStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .journey-step.highlight {
      transform: translateY(-5px);
      box-shadow: var(--shadow-lg);
    }
    
    .journey-node.highlight {
      fill: var(--color-accent);
      r: 20;
    }
  `;
  
  document.head.appendChild(style);
}

// Add highlight styles when DOM is loaded
document.addEventListener('DOMContentLoaded', addJourneyHighlightStyles);
