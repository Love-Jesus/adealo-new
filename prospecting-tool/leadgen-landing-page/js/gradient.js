// Stripe-like Gradient Animation
// Creates an animated gradient background with diagonal stripes and breathing effects

class Gradient {
  constructor() {
    this.canvas = document.getElementById('gradient-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Stripe-like color palette
    this.colors = [
      { r: 103, g: 58, b: 183, a: 1 },    // Purple
      { r: 63, g: 81, b: 181, a: 1 },     // Indigo
      { r: 233, g: 30, b: 99, a: 0.8 },   // Pink
      { r: 156, g: 39, b: 176, a: 0.9 },  // Purple
      { r: 33, g: 150, b: 243, a: 0.85 }  // Blue
    ];
    
    // Animation parameters
    this.gradientSpeed = 0.002;
    this.stripeWidth = 250;
    this.stripeAngle = 45;
    this.breathingSpeed = 0.5;
    this.time = 0;
    this.stripeOffset = 0;
    
    // Initialize color transitions
    this.currentColors = this.colors.map(color => ({ ...color }));
    this.targetColors = this.colors.map(color => ({ ...color }));
    
    this.init();
    this.animate();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.canvas.setAttribute('data-transition-in', '');
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  lerp(start, end, t) {
    return start * (1 - t) + end * t;
  }

  updateColors() {
    let needsUpdate = false;
    
    this.currentColors.forEach((current, i) => {
      const target = this.targetColors[i];
      
      ['r', 'g', 'b', 'a'].forEach(channel => {
        if (Math.abs(current[channel] - target[channel]) > 0.01) {
          current[channel] = this.lerp(current[channel], target[channel], this.gradientSpeed);
          needsUpdate = true;
        }
      });
    });

    if (!needsUpdate) {
      this.targetColors = this.targetColors.map((_, i) => {
        const nextIndex = (i + 1) % this.colors.length;
        return { ...this.colors[nextIndex] };
      });
    }
  }

  // Convert angle in degrees to radians
  degToRad(degrees) {
    return degrees * Math.PI / 180;
  }

  // Draw diagonal stripes with breathing effect
  drawStripes() {
    const { width, height } = this.canvas;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);
    
    // Calculate stripe parameters
    const angle = this.degToRad(this.stripeAngle);
    const sinAngle = Math.sin(angle);
    const cosAngle = Math.cos(angle);
    
    // Calculate the diagonal length to ensure stripes cover the entire canvas
    const diagonalLength = Math.sqrt(width * width + height * height);
    
    // Breathing effect - subtle pulsing
    const breathingFactor = 1 + 0.05 * Math.sin(this.time * this.breathingSpeed);
    
    // Update stripe offset for animation
    this.stripeOffset = (this.stripeOffset + 0.5) % this.stripeWidth;
    
    // Draw multiple layers of stripes with different colors and opacities
    for (let layer = 0; layer < this.currentColors.length; layer++) {
      const color = this.currentColors[layer];
      const layerOffset = (this.stripeOffset + layer * 50) % this.stripeWidth;
      
      // Draw stripes for this layer
      for (let i = -diagonalLength; i < diagonalLength; i += this.stripeWidth * breathingFactor) {
        const position = i + layerOffset;
        
        // Create gradient for this stripe
        const startX = position * cosAngle;
        const startY = position * sinAngle;
        const endX = startX + this.stripeWidth * 2 * cosAngle;
        const endY = startY + this.stripeWidth * 2 * sinAngle;
        
        const gradient = this.ctx.createLinearGradient(startX, startY, endX, endY);
        
        // Add color stops with transparency
        gradient.addColorStop(0, `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, 0)`);
        gradient.addColorStop(0.5, `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${color.a})`);
        gradient.addColorStop(1, `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, 0)`);
        
        // Draw stripe
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        
        // Calculate the four corners of the stripe
        const stripeWidth = this.stripeWidth * 1.5 * breathingFactor;
        const halfWidth = stripeWidth / 2;
        
        // Perpendicular direction to the stripe angle
        const perpX = -sinAngle;
        const perpY = cosAngle;
        
        // Four corners of the stripe rectangle
        const x1 = position * cosAngle - halfWidth * perpX;
        const y1 = position * sinAngle - halfWidth * perpY;
        const x2 = position * cosAngle + halfWidth * perpX;
        const y2 = position * sinAngle + halfWidth * perpY;
        const x3 = x2 + diagonalLength * cosAngle;
        const y3 = y2 + diagonalLength * sinAngle;
        const x4 = x1 + diagonalLength * cosAngle;
        const y4 = y1 + diagonalLength * sinAngle;
        
        // Draw the stripe as a quadrilateral
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.lineTo(x3, y3);
        this.ctx.lineTo(x4, y4);
        this.ctx.closePath();
        this.ctx.fill();
      }
    }
    
    // Add a subtle overlay gradient for depth
    const overlay = this.ctx.createLinearGradient(0, 0, width, height);
    overlay.addColorStop(0, 'rgba(103, 58, 183, 0.1)');
    overlay.addColorStop(1, 'rgba(33, 150, 243, 0.1)');
    
    this.ctx.fillStyle = overlay;
    this.ctx.fillRect(0, 0, width, height);
  }

  animate() {
    // Update time for animations
    this.time += 0.01;
    
    // Update colors for transitions
    this.updateColors();
    
    // Draw the animated stripes
    this.drawStripes();
    
    // Continue animation loop
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize gradient when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Gradient();
});
