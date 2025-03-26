/**
 * Gradient Background
 * Creates an animated gradient background using Canvas
 * Inspired by Stripe's gradient effect
 */

// Initialize gradient background
function initGradientBackground() {
  const canvas = document.getElementById('gradient-canvas');
  
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Set canvas dimensions to match window size
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  
  // Call resize initially and on window resize
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Gradient colors
  const colors = [
    { r: 67, g: 97, b: 238 },    // Primary blue
    { r: 114, g: 9, b: 183 },    // Secondary purple
    { r: 76, g: 201, b: 240 },   // Accent blue
    { r: 58, g: 12, b: 163 }     // Dark purple
  ];
  
  // Gradient blobs
  const blobs = [];
  
  // Create initial blobs
  for (let i = 0; i < 6; i++) {
    blobs.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 300 + 200,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: Math.random() * 0.5 - 0.25,
      vy: Math.random() * 0.5 - 0.25,
      alpha: Math.random() * 0.5 + 0.2
    });
  }
  
  // Animation loop
  function animate() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(67, 97, 238, 0.5)');
    gradient.addColorStop(1, 'rgba(114, 9, 183, 0.5)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw and update blobs
    blobs.forEach(blob => {
      // Draw blob
      const gradient = ctx.createRadialGradient(
        blob.x, blob.y, 0,
        blob.x, blob.y, blob.radius
      );
      
      gradient.addColorStop(0, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, ${blob.alpha})`);
      gradient.addColorStop(1, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Update blob position
      blob.x += blob.vx;
      blob.y += blob.vy;
      
      // Bounce off edges
      if (blob.x < -blob.radius) blob.x = canvas.width + blob.radius;
      if (blob.x > canvas.width + blob.radius) blob.x = -blob.radius;
      if (blob.y < -blob.radius) blob.y = canvas.height + blob.radius;
      if (blob.y > canvas.height + blob.radius) blob.y = -blob.radius;
    });
    
    // Apply noise texture
    applyNoise(ctx, canvas.width, canvas.height, 0.02);
    
    // Continue animation loop
    requestAnimationFrame(animate);
  }
  
  // Start animation
  animate();
}

/**
 * Apply noise texture to canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} opacity - Noise opacity
 */
function applyNoise(ctx, width, height, opacity) {
  // Create noise pattern
  const noiseData = new ImageData(width, height);
  const data = noiseData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() * 255;
    
    data[i] = noise;
    data[i + 1] = noise;
    data[i + 2] = noise;
    data[i + 3] = opacity * 255;
  }
  
  // Apply noise pattern
  ctx.globalCompositeOperation = 'overlay';
  ctx.putImageData(noiseData, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
}
