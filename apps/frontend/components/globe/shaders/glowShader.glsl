/**
 * Glow Shader - Atmospheric Rim Lighting
 * Creates a glowing atmospheric effect around the globe
 */

uniform vec3 glowColor;
uniform float glowIntensity;
uniform float time;
uniform vec3 viewDirection;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(viewDirection - vWorldPosition);
  
  // Calculate rim lighting (fresnel effect)
  float rim = 1.0 - max(dot(normal, viewDir), 0.0);
  rim = pow(rim, 2.0);
  
  // Add subtle pulsing animation
  float pulse = sin(time * 0.5) * 0.1 + 0.9;
  
  // Combine rim lighting with glow color
  vec3 finalColor = glowColor * rim * glowIntensity * pulse;
  
  gl_FragColor = vec4(finalColor, rim * glowIntensity * pulse);
}

