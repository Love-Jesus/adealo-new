// Journey Section Gradient Background with Three.js
// Creates a clean, modern gradient background with subtle movement

class JourneyGradient {
  constructor() {
    this.container = document.querySelector('.journey-section');
    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('journey-gradient-canvas');
    
    // Insert canvas as the first child of the journey section
    if (this.container) {
      this.container.insertBefore(this.canvas, this.container.firstChild);
      
      // Set canvas styles
      this.canvas.style.position = 'absolute';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.zIndex = '0';
      this.canvas.style.opacity = '1';
      
      // Initialize Three.js scene
      this.initThree();
      
      // Handle resize events
      window.addEventListener('resize', this.onResize.bind(this));
    }
  }
  
  initThree() {
    // Create scene, camera, and renderer
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    
    // Create shader material with custom fragment shader
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(this.container.offsetWidth, this.container.offsetHeight) },
        u_mouse: { value: new THREE.Vector2(0, 0) }
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        
        // Brand colors - intensified for better visibility
        vec3 colorPrimary = vec3(0.31, 0.45, 0.98);      // #4F73FA - Bright primary blue
        vec3 colorSecondary = vec3(0.51, 0.06, 0.82);    // #830FD1 - Bright secondary purple
        vec3 colorAccent = vec3(0.35, 0.85, 1.0);        // #59D9FF - Bright accent blue
        
        void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          
          // Create subtle movement
          float time = u_time * 0.03;
          
          // Simple smooth gradient with subtle movement
          float gradientPos = uv.x + sin(time + uv.y * 1.5) * 0.05;
          
          // Mouse interaction (very subtle)
          float mouseDistance = distance(uv, u_mouse / u_resolution.xy);
          float mouseInfluence = smoothstep(0.4, 0.0, mouseDistance) * 0.05;
          
          // Smooth gradient between brand colors
          vec3 gradient = mix(
            mix(colorPrimary, colorSecondary, gradientPos),
            colorAccent,
            uv.y + sin(time * 0.7) * 0.1 + mouseInfluence
          );
          
          // Add subtle vignette for depth
          float vignette = smoothstep(1.2, 0.5, length(uv - 0.5) * 1.2);
          vec3 finalColor = mix(gradient * 0.9, gradient, vignette);
          
          gl_FragColor = vec4(finalColor, 0.15); // Low opacity for subtlety
        }
      `,
      transparent: true
    });
    
    // Create a full-screen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(mesh);
    
    // Add mouse movement tracking
    document.addEventListener('mousemove', (event) => {
      this.material.uniforms.u_mouse.value.x = event.clientX;
      this.material.uniforms.u_mouse.value.y = this.container.offsetHeight - event.clientY;
    });
    
    // Start animation loop
    this.animate();
  }
  
  animate() {
    // Update time uniform
    this.material.uniforms.u_time.value += 0.01;
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
    
    // Continue animation loop
    requestAnimationFrame(this.animate.bind(this));
  }
  
  onResize() {
    // Update canvas size and uniforms on window resize
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.material.uniforms.u_resolution.value.x = this.container.offsetWidth;
    this.material.uniforms.u_resolution.value.y = this.container.offsetHeight;
  }
}

// Initialize the gradient when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new JourneyGradient();
});
