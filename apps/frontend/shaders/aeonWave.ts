import * as THREE from 'three';

/**
 * Additional wave effect shader that can be layered on top of arcs
 * Creates a more pronounced traveling lightwave effect
 * 
 * FIX: Removed redundant attribute/uniform declarations - drei's shaderMaterial
 * automatically provides: position, uv, modelViewMatrix, projectionMatrix
 */
export const aeonWaveVertexShader = /* glsl */`
// Custom varyings only - built-ins are provided by drei/Three.js
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/**
 * Aeon Wave Fragment Shader
 * Creates a smooth traveling wave of light along the arc
 */
export const aeonWaveFragmentShader = /* glsl */`
precision highp float;

uniform float u_time;
uniform float u_waveSpeed;
uniform float u_waveIntensity;
uniform vec3 u_waveColor;
uniform float u_waveWidth;

varying vec2 vUv;
varying vec3 vPosition;

float smoothWave(float pos, float center, float width) {
  float dist = abs(pos - center);
  return smoothstep(width, 0.0, dist);
}

float noise(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  float arcPos = vUv.x;
  float wavePos = mod(u_time * u_waveSpeed, 1.0);
  float dist = abs(arcPos - wavePos);
  float wrappedDist = min(dist, 1.0 - dist);
  float wave = smoothWave(arcPos, wavePos, u_waveWidth);
  float shimmer = noise(vPosition.xy * 100.0 + u_time * 0.5) * 0.1;
  float intensity = wave * u_waveIntensity * (1.0 + shimmer);
  float edgeFade = smoothstep(0.0, 0.1, arcPos) * smoothstep(1.0, 0.9, arcPos);
  intensity *= edgeFade;
  vec3 color = u_waveColor * intensity;
  float alpha = intensity * 0.8;
  
  gl_FragColor = vec4(color, alpha);
}
`;

/**
 * Create Aeon Wave Shader Material
 */
export function createAeonWaveMaterial(params: {
  waveColor: THREE.Color | string;
  waveSpeed?: number;
  waveIntensity?: number;
  waveWidth?: number;
}): THREE.ShaderMaterial {
  const {
    waveColor,
    waveSpeed = 0.6,
    waveIntensity = 1.5,
    waveWidth = 0.12,
  } = params;

  const color = typeof waveColor === 'string' 
    ? new THREE.Color(waveColor) 
    : waveColor;

  const material = new THREE.ShaderMaterial({
    vertexShader: aeonWaveVertexShader,
    fragmentShader: aeonWaveFragmentShader,
    uniforms: {
      u_time: { value: 0 },
      u_waveSpeed: { value: waveSpeed },
      u_waveIntensity: { value: waveIntensity },
      u_waveColor: { value: color },
      u_waveWidth: { value: waveWidth },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  return material;
}

/**
 * Update wave time uniform
 */
export function updateAeonWaveTime(material: THREE.ShaderMaterial, time: number): void {
  if (material.uniforms?.u_time) {
    material.uniforms.u_time.value = time;
  }
}

