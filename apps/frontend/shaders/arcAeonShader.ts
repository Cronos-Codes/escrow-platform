import * as THREE from 'three';

/**
 * GLSL Vertex Shader for Arc Rendering
 * Passes UV coordinates along the arc path for fragment shader use
 * 
 * FIX: Removed redundant attribute/uniform declarations - drei's shaderMaterial
 * automatically provides: position, uv, modelViewMatrix, projectionMatrix, normalMatrix
 */
export const arcVertexShader = /* glsl */`
// Custom varyings only - built-ins are provided by drei/Three.js
varying vec2 vUv;
varying float vArcLength;

void main() {
  vUv = uv;
  vArcLength = uv.x;
  
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
`;

/**
 * GLSL Fragment Shader for Arc Rendering with Aeon Energy Wave
 * Implements moving gradient, glow effects, and time-based animations
 */
export const arcFragmentShader = /* glsl */`
precision highp float;

uniform float u_time;
uniform vec3 u_colorStart;
uniform vec3 u_colorEnd;
uniform float u_intensity;
uniform float u_waveSpeed;
uniform float u_waveWidth;
uniform float u_glowStrength;

varying vec2 vUv;
varying float vArcLength;

// Easing function for smooth transitions
float easeInOutSine(float x) {
  return -(cos(3.14159265359 * x) - 1.0) / 2.0;
}

// Smooth step for wave pulse
float smoothPulse(float edge0, float edge1, float x) {
  return smoothstep(edge0, edge1, x) * (1.0 - smoothstep(1.0 - edge1, 1.0 - edge0, x));
}

void main() {
  float arcPos = vArcLength;
  float wavePhase = mod(u_time * u_waveSpeed, 1.0);
  float waveDistance = abs(arcPos - wavePhase);
  float wave = smoothPulse(0.0, u_waveWidth, waveDistance);
  vec3 baseColor = mix(u_colorStart, u_colorEnd, easeInOutSine(arcPos));
  vec3 waveColor = baseColor * (1.0 + wave * 2.0);
  float edgeGlow = smoothstep(0.0, 0.15, arcPos) * smoothstep(1.0, 0.85, arcPos);
  vec3 glowColor = waveColor + u_colorStart * edgeGlow * u_glowStrength;
  vec3 finalColor = glowColor * u_intensity;
  float alpha = smoothstep(0.0, 0.1, arcPos) * smoothstep(1.0, 0.9, arcPos);
  alpha = max(alpha, 0.3);
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;

/**
 * Create ShaderMaterial for arc rendering
 */
export function createArcShaderMaterial(params: {
  colorStart: THREE.Color | string;
  colorEnd: THREE.Color | string;
  intensity?: number;
  waveSpeed?: number;
  waveWidth?: number;
  glowStrength?: number;
}): THREE.ShaderMaterial {
  const {
    colorStart,
    colorEnd,
    intensity = 1.0,
    waveSpeed = 0.5,
    waveWidth = 0.15,
    glowStrength = 0.5,
  } = params;

  // Convert colors to THREE.Color if strings
  const startColor = typeof colorStart === 'string' 
    ? new THREE.Color(colorStart) 
    : colorStart;
  const endColor = typeof colorEnd === 'string' 
    ? new THREE.Color(colorEnd) 
    : colorEnd;

  const material = new THREE.ShaderMaterial({
    vertexShader: arcVertexShader,
    fragmentShader: arcFragmentShader,
    uniforms: {
      u_time: { value: 0 },
      u_colorStart: { value: startColor },
      u_colorEnd: { value: endColor },
      u_intensity: { value: intensity },
      u_waveSpeed: { value: waveSpeed },
      u_waveWidth: { value: waveWidth },
      u_glowStrength: { value: glowStrength },
    },
    transparent: true,
    blending: THREE.AdditiveBlending, // Additive blending for glow effect
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  return material;
}

/**
 * Update shader uniforms for animation
 */
export function updateArcShaderTime(material: THREE.ShaderMaterial, time: number): void {
  if (material.uniforms?.u_time) {
    material.uniforms.u_time.value = time;
  }
}

/**
 * Update shader color uniforms
 */
export function updateArcShaderColors(
  material: THREE.ShaderMaterial,
  colorStart: THREE.Color | string,
  colorEnd: THREE.Color | string
): void {
  const startColor = typeof colorStart === 'string' 
    ? new THREE.Color(colorStart) 
    : colorStart;
  const endColor = typeof colorEnd === 'string' 
    ? new THREE.Color(colorEnd) 
    : endColor;

  if (material.uniforms?.u_colorStart) {
    material.uniforms.u_colorStart.value = startColor;
  }
  if (material.uniforms?.u_colorEnd) {
    material.uniforms.u_colorEnd.value = endColor;
  }
}

/**
 * Update shader intensity
 */
export function updateArcShaderIntensity(
  material: THREE.ShaderMaterial,
  intensity: number
): void {
  if (material.uniforms?.u_intensity) {
    material.uniforms.u_intensity.value = intensity;
  }
}

