// Advanced Gradient Animation with Three.js
// Creates a fluid, animated gradient background with organic movement and color transitions

class AdvancedGradient {
  constructor() {
    // Canvas element
    this.canvas = document.getElementById('gradient-canvas');
    
    // Animation properties
    this.time = 0;
    this.mouse = { x: 0, y: 0 };
    this.lastMouse = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    
    // Color palettes - inspired by Stripe's website
    this.colorPalettes = [
      // Purple to blue palette
      [
        { r: 0.267, g: 0.38, b: 0.933 },  // #4361ee - Primary blue
        { r: 0.447, g: 0.035, b: 0.718 }, // #7209b7 - Purple
        { r: 0.227, g: 0.047, b: 0.639 }, // #3a0ca3 - Deep purple
        { r: 0.298, g: 0.788, b: 0.941 }  // #4cc9f0 - Light blue
      ],
      // Red to purple palette
      [
        { r: 0.447, g: 0.035, b: 0.718 }, // #7209b7 - Purple
        { r: 0.969, g: 0.145, b: 0.522 }, // #f72585 - Pink
        { r: 0.71, g: 0.094, b: 0.62 },   // #b5179e - Magenta
        { r: 0.337, g: 0.047, b: 0.741 }  // #560bad - Deep purple
      ],
      // Blue to teal palette
      [
        { r: 0.267, g: 0.38, b: 0.933 },  // #4361ee - Primary blue
        { r: 0.298, g: 0.788, b: 0.941 }, // #4cc9f0 - Light blue
        { r: 0.282, g: 0.584, b: 0.937 }, // #4895ef - Sky blue
        { r: 0.247, g: 0.216, b: 0.788 }  // #3f37c9 - Deep blue
      ]
    ];
    
    // Current color palette
    this.currentPalette = 0;
    this.colors = this.colorPalettes[this.currentPalette];
    
    // Try to initialize Three.js
    try {
      this.initThreeJS();
    } catch (error) {
      console.error("Failed to initialize Three.js gradient:", error);
      this.fallbackToCanvas();
    }
  }

  initThreeJS() {
    if (!window.THREE) {
      throw new Error("THREE.js not loaded");
    }
    
    // Set up Three.js renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Set up scene and camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    this.camera.position.z = 1;
    
    // Create a simple plane geometry that fills the screen
    this.geometry = new THREE.PlaneGeometry(2, 2);
    
    // Create shader material
    this.createMaterial();
    
    // Create mesh and add to scene
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
    
    // Add event listeners
    this.addEventListeners();
    
    // Start animation loop
    this.animate();
  }

  createMaterial() {
    // Create shader material
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_mouse: { value: new THREE.Vector2(0, 0) },
        u_velocity: { value: new THREE.Vector2(0, 0) },
        u_color1: { value: new THREE.Vector3(this.colors[0].r, this.colors[0].g, this.colors[0].b) },
        u_color2: { value: new THREE.Vector3(this.colors[1].r, this.colors[1].g, this.colors[1].b) },
        u_color3: { value: new THREE.Vector3(this.colors[2].r, this.colors[2].g, this.colors[2].b) },
        u_color4: { value: new THREE.Vector3(this.colors[3].r, this.colors[3].g, this.colors[3].b) }
      },
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        uniform vec2 u_velocity;
        uniform vec3 u_color1;
        uniform vec3 u_color2;
        uniform vec3 u_color3;
        uniform vec3 u_color4;
        
        varying vec2 vUv;
        
        // Classic Perlin 2D Noise by Stefan Gustavson
        vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        vec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

        float cnoise(vec2 P) {
          vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
          vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
          Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
          vec4 ix = Pi.xzxz;
          vec4 iy = Pi.yyww;
          vec4 fx = Pf.xzxz;
          vec4 fy = Pf.yyww;
          vec4 i = permute(permute(ix) + iy);
          vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
          vec4 gy = abs(gx) - 0.5;
          vec4 tx = floor(gx + 0.5);
          gx = gx - tx;
          vec2 g00 = vec2(gx.x,gy.x);
          vec2 g10 = vec2(gx.y,gy.y);
          vec2 g01 = vec2(gx.z,gy.z);
          vec2 g11 = vec2(gx.w,gy.w);
          vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
          g00 *= norm.x;
          g01 *= norm.y;
          g10 *= norm.z;
          g11 *= norm.w;
          float n00 = dot(g00, vec2(fx.x, fy.x));
          float n10 = dot(g10, vec2(fx.y, fy.y));
          float n01 = dot(g01, vec2(fx.z, fy.z));
          float n11 = dot(g11, vec2(fx.w, fy.w));
          vec2 fade_xy = fade(Pf.xy);
          vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
          float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
          return 2.3 * n_xy;
        }
        
        // Function to blend between colors based on noise
        vec3 blendColors(float t) {
          // Create smooth transitions between all 4 colors
          if (t < 0.33) {
            return mix(u_color1, u_color2, smoothstep(0.0, 0.33, t) * 3.0);
          } else if (t < 0.66) {
            return mix(u_color2, u_color3, smoothstep(0.33, 0.66, t) * 3.0 - 1.0);
          } else {
            return mix(u_color3, u_color4, smoothstep(0.66, 1.0, t) * 3.0 - 2.0);
          }
        }
        
        void main() {
          // Normalized coordinates
          vec2 uv = vUv;
          
          // Aspect ratio correction
          float aspect = u_resolution.x / u_resolution.y;
          vec2 scaled_uv = vec2(uv.x * aspect, uv.y);
          
          // Mouse influence (subtle)
          vec2 mouse_norm = u_mouse / u_resolution;
          float mouse_influence = 0.05;
          scaled_uv += mouse_norm * mouse_influence;
          
          // Create multiple layers of noise with different scales and speeds
          float noise_scale1 = 2.0;
          float noise_scale2 = 4.0;
          float noise_scale3 = 8.0;
          
          float time_speed1 = u_time * 0.1;
          float time_speed2 = u_time * 0.15;
          float time_speed3 = u_time * 0.05;
          
          // Add velocity influence to the noise
          vec2 vel_influence = u_velocity * 0.001;
          
          // Generate noise values
          float noise1 = cnoise(scaled_uv * noise_scale1 + vec2(time_speed1) + vel_influence);
          float noise2 = cnoise(scaled_uv * noise_scale2 + vec2(time_speed2) - vel_influence);
          float noise3 = cnoise(scaled_uv * noise_scale3 + vec2(time_speed3));
          
          // Combine noise layers
          float final_noise = (noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2) * 0.5 + 0.5;
          
          // Create diagonal gradient effect
          float diagonal = (uv.x + uv.y) * 0.5;
          float gradient = diagonal * 0.7 + final_noise * 0.3;
          
          // Get color from our palette based on the noise value
          vec3 color = blendColors(gradient);
          
          // Output final color
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: true
    });
  }

  changeColorPalette() {
    // Cycle to the next color palette
    this.currentPalette = (this.currentPalette + 1) % this.colorPalettes.length;
    this.colors = this.colorPalettes[this.currentPalette];
    
    // Update uniforms with new colors
    if (this.material && this.material.uniforms) {
      this.material.uniforms.u_color1.value.set(this.colors[0].r, this.colors[0].g, this.colors[0].b);
      this.material.uniforms.u_color2.value.set(this.colors[1].r, this.colors[1].g, this.colors[1].b);
      this.material.uniforms.u_color3.value.set(this.colors[2].r, this.colors[2].g, this.colors[2].b);
      this.material.uniforms.u_color4.value.set(this.colors[3].r, this.colors[3].g, this.colors[3].b);
    }
  }

  handleResize() {
    // Update renderer and uniforms on window resize
    if (this.renderer) {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    if (this.material && this.material.uniforms) {
      this.material.uniforms.u_resolution.value.x = window.innerWidth;
      this.material.uniforms.u_resolution.value.y = window.innerHeight;
    }
    
    if (this.canvasCtx) {
      this.canvasWidth = this.canvas.width = window.innerWidth;
      this.canvasHeight = this.canvas.height = window.innerHeight;
    }
  }

  addEventListeners() {
    // Add window resize listener
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Mouse move listener for interactive effects
    window.addEventListener('mousemove', (e) => {
      // Calculate normalized mouse position
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      // Calculate mouse velocity
      this.velocity.x = x - this.lastMouse.x;
      this.velocity.y = y - this.lastMouse.y;
      
      // Update mouse position
      this.mouse.x = x;
      this.mouse.y = y;
      
      // Update last mouse position
      this.lastMouse.x = x;
      this.lastMouse.y = y;
    });
    
    // Change color palette on click
    window.addEventListener('click', () => {
      this.changeColorPalette();
    });
  }

  animate() {
    // Update time
    this.time += 0.01;
    
    // Update uniforms
    if (this.material && this.material.uniforms) {
      this.material.uniforms.u_time.value = this.time;
      this.material.uniforms.u_mouse.value.set(this.mouse.x, this.mouse.y);
      
      // Apply damping to velocity
      this.velocity.x *= 0.95;
      this.velocity.y *= 0.95;
      this.material.uniforms.u_velocity.value.set(this.velocity.x, this.velocity.y);
      
      // Render the scene
      this.renderer.render(this.scene, this.camera);
    } else if (this.canvasCtx) {
      // Fallback canvas animation
      this.drawCanvasGradient();
    }
    
    // Continue animation loop
    requestAnimationFrame(this.animate.bind(this));
  }

  // Fallback to canvas-based gradient if Three.js fails
  fallbackToCanvas() {
    console.log("Using canvas fallback for gradient");
    
    // Set up canvas
    this.canvasWidth = this.canvas.width = window.innerWidth;
    this.canvasHeight = this.canvas.height = window.innerHeight;
    this.canvasCtx = this.canvas.getContext('2d');
    
    // Add event listeners
    this.addEventListeners();
    
    // Start animation
    this.animate();
  }

  // Draw gradient using canvas API as fallback
  drawCanvasGradient() {
    const ctx = this.canvasCtx;
    const width = this.canvasWidth;
    const height = this.canvasHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    
    // Add color stops
    const colors = this.colors;
    gradient.addColorStop(0, `rgb(${Math.floor(colors[0].r * 255)}, ${Math.floor(colors[0].g * 255)}, ${Math.floor(colors[0].b * 255)})`);
    gradient.addColorStop(0.33, `rgb(${Math.floor(colors[1].r * 255)}, ${Math.floor(colors[1].g * 255)}, ${Math.floor(colors[1].b * 255)})`);
    gradient.addColorStop(0.66, `rgb(${Math.floor(colors[2].r * 255)}, ${Math.floor(colors[2].g * 255)}, ${Math.floor(colors[2].b * 255)})`);
    gradient.addColorStop(1, `rgb(${Math.floor(colors[3].r * 255)}, ${Math.floor(colors[3].g * 255)}, ${Math.floor(colors[3].b * 255)})`);
    
    // Fill with gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add some animated "noise" with circles
    const time = this.time;
    const circleCount = 20;
    
    for (let i = 0; i < circleCount; i++) {
      const x = width * (0.5 + 0.3 * Math.sin(time * 0.1 + i * 0.5));
      const y = height * (0.5 + 0.3 * Math.cos(time * 0.1 + i * 0.5));
      const radius = Math.max(width, height) * 0.05 * (0.5 + 0.5 * Math.sin(time * 0.2 + i));
      
      const circleGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      const colorIndex = i % 4;
      const color = colors[colorIndex];
      
      circleGradient.addColorStop(0, `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, 0.1)`);
      circleGradient.addColorStop(1, `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, 0)`);
      
      ctx.fillStyle = circleGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Initialize the advanced gradient when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AdvancedGradient();
});
