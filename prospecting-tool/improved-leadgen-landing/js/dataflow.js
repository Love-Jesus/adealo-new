/**
 * Data Flow Visualization
 * Creates an animated data flow visualization for the hero section
 */

// Initialize data flow visualization
function initDataFlow() {
  const container = document.getElementById('data-flow-canvas');
  
  if (!container) return;
  
  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  container.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  
  // Resize canvas on window resize
  window.addEventListener('resize', () => {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  });
  
  // Data points
  const dataPoints = [];
  
  // Create path points
  const pathPoints = createBezierPath(
    { x: 0, y: canvas.height / 2 },
    { x: canvas.width, y: canvas.height / 2 },
    canvas.height / 4
  );
  
  // Animation loop
  function animate() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw path
    ctx.beginPath();
    ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
    
    for (let i = 1; i < pathPoints.length; i++) {
      ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
    }
    
    ctx.strokeStyle = 'rgba(67, 97, 238, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Create new data points
    if (Math.random() < 0.1) {
      dataPoints.push({
        x: 0,
        y: canvas.height / 2,
        progress: 0,
        speed: Math.random() * 0.01 + 0.005,
        size: Math.random() * 4 + 2,
        color: getRandomColor()
      });
    }
    
    // Draw and update data points
    for (let i = dataPoints.length - 1; i >= 0; i--) {
      const point = dataPoints[i];
      
      // Update progress
      point.progress += point.speed;
      
      // Remove points that have completed the path
      if (point.progress >= 1) {
        dataPoints.splice(i, 1);
        continue;
      }
      
      // Calculate position along the path
      const index = Math.floor(point.progress * (pathPoints.length - 1));
      const nextIndex = Math.min(index + 1, pathPoints.length - 1);
      const subProgress = (point.progress * (pathPoints.length - 1)) - index;
      
      point.x = lerp(pathPoints[index].x, pathPoints[nextIndex].x, subProgress);
      point.y = lerp(pathPoints[index].y, pathPoints[nextIndex].y, subProgress);
      
      // Draw data point
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
      ctx.fillStyle = point.color;
      ctx.fill();
      
      // Draw glow effect
      const gradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, point.size * 3
      );
      
      gradient.addColorStop(0, point.color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    // Continue animation loop
    requestAnimationFrame(animate);
  }
  
  // Start animation when the element is in view
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      animate();
      observer.unobserve(container);
    }
  }, {
    threshold: 0.1
  });
  
  observer.observe(container);
}

/**
 * Create a bezier path between two points
 * @param {Object} start - Start point {x, y}
 * @param {Object} end - End point {x, y}
 * @param {number} variance - Maximum variance from straight line
 * @returns {Array} - Array of points along the path
 */
function createBezierPath(start, end, variance) {
  const points = [];
  const numPoints = 100;
  
  // Create control points
  const control1 = {
    x: start.x + (end.x - start.x) / 3,
    y: start.y + (Math.random() * variance * 2 - variance)
  };
  
  const control2 = {
    x: start.x + (end.x - start.x) * 2 / 3,
    y: start.y + (Math.random() * variance * 2 - variance)
  };
  
  // Calculate points along the bezier curve
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    
    const point = {
      x: bezierPoint(start.x, control1.x, control2.x, end.x, t),
      y: bezierPoint(start.y, control1.y, control2.y, end.y, t)
    };
    
    points.push(point);
  }
  
  return points;
}

/**
 * Calculate a point along a cubic bezier curve
 * @param {number} p0 - Start point
 * @param {number} p1 - Control point 1
 * @param {number} p2 - Control point 2
 * @param {number} p3 - End point
 * @param {number} t - Progress (0-1)
 * @returns {number} - Point value
 */
function bezierPoint(p0, p1, p2, p3, t) {
  const oneMinusT = 1 - t;
  return Math.pow(oneMinusT, 3) * p0 +
         3 * Math.pow(oneMinusT, 2) * t * p1 +
         3 * oneMinusT * Math.pow(t, 2) * p2 +
         Math.pow(t, 3) * p3;
}

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Progress (0-1)
 * @returns {number} - Interpolated value
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Get random color with specified opacity
 * @param {number} opacity - Color opacity (0-1)
 * @returns {string} - RGBA color string
 */
function getRandomColor(opacity = 0.7) {
  const colors = [
    [67, 97, 238],    // Primary blue
    [114, 9, 183],    // Secondary purple
    [76, 201, 240],   // Accent blue
    [58, 12, 163]     // Dark purple
  ];
  
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
}
