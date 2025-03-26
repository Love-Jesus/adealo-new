/**
 * Network Visualization
 * Creates an interactive network visualization for the metrics section
 */

// Initialize network visualization
function initNetworkVisualization() {
  const container = document.getElementById('network-visualization');
  
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
  
  // Network nodes
  const nodes = [];
  
  // Network connections
  const connections = [];
  
  // Create nodes
  for (let i = 0; i < 30; i++) {
    nodes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 3 + 2,
      color: getRandomColor(),
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      connected: []
    });
  }
  
  // Create connections between nodes
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const numConnections = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < numConnections; j++) {
      const targetIndex = Math.floor(Math.random() * nodes.length);
      
      if (targetIndex !== i && !node.connected.includes(targetIndex)) {
        node.connected.push(targetIndex);
        
        connections.push({
          source: i,
          target: targetIndex,
          width: Math.random() * 1 + 0.5,
          color: getRandomColor(0.2)
        });
      }
    }
  }
  
  // Animation loop
  function animate() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections
    connections.forEach(connection => {
      const source = nodes[connection.source];
      const target = nodes[connection.target];
      
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = connection.color;
      ctx.lineWidth = connection.width;
      ctx.stroke();
    });
    
    // Draw and update nodes
    nodes.forEach(node => {
      // Draw node
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();
      
      // Update node position
      node.x += node.vx;
      node.y += node.vy;
      
      // Bounce off edges
      if (node.x < node.radius || node.x > canvas.width - node.radius) {
        node.vx *= -1;
      }
      
      if (node.y < node.radius || node.y > canvas.height - node.radius) {
        node.vy *= -1;
      }
    });
    
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
 * Get random color with specified opacity
 * @param {number} opacity - Color opacity (0-1)
 * @returns {string} - RGBA color string
 */
function getRandomColor(opacity = 1) {
  const colors = [
    [67, 97, 238],    // Primary blue
    [114, 9, 183],    // Secondary purple
    [76, 201, 240],   // Accent blue
    [58, 12, 163]     // Dark purple
  ];
  
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
}
