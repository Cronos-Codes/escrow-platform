/**
 * Arc Shader - Animated Traveling Pulse
 * Creates a gradient arc with a traveling pulse effect
 */

uniform vec3 startColor;
uniform vec3 endColor;
uniform float time;
uniform float pulseSpeed;
uniform float pulseOffset;
uniform float arcLength;
uniform float alpha;

varying float vDistance;

void main() {
  // Calculate position along arc (0 to 1)
  float position = vDistance / arcLength;
  
  // Create traveling pulse wave
  float pulsePosition = mod((time * pulseSpeed) + pulseOffset, 1.0);
  float pulseWidth = 0.15;
  
  // Calculate distance from pulse center
  float distFromPulse = abs(position - pulsePosition);
  
  // Create pulse effect (bright in center, fade at edges)
  float pulseIntensity = 1.0 - smoothstep(0.0, pulseWidth, distFromPulse);
  
  // Gradient color from start to end
  vec3 gradientColor = mix(startColor, endColor, position);
  
  // Add pulse glow
  vec3 finalColor = gradientColor * (0.3 + pulseIntensity * 0.7);
  
  // Alpha fades at edges and pulses in center
  float edgeFade = smoothstep(0.0, 0.1, position) * smoothstep(1.0, 0.9, position);
  float finalAlpha = alpha * edgeFade * (0.4 + pulseIntensity * 0.6);
  
  gl_FragColor = vec4(finalColor, finalAlpha);
}

