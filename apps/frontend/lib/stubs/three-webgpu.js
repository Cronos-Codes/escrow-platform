// Stub module for three/webgpu
// This is an optional experimental feature that react-globe.gl tries to import
// If WebGPU is not available, the library will fall back to WebGL

// CommonJS export for Node.js/webpack
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
  module.exports.WebGPURenderer = null;
  module.exports.WebGPU = null;
  module.exports.default = {};
}

// ESM export for browser
export default {};
export const WebGPURenderer = null;
export const WebGPU = null;

