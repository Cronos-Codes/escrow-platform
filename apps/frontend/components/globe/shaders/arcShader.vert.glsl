uniform float arcLength;
varying float vDistance;

void main() {
  vDistance = position.z * arcLength;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

