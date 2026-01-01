const path = require('path');
const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@escrow/ui', '@escrow/auth', '@escrow/schemas', 'react-globe.gl', 'globe.gl', 'three-globe'],
  images: {
    domains: ['localhost', 'images.unsplash.com', 'img.freepik.com'],
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    // Force single instance of Three.js to avoid multiple instance warnings
    // This ensures react-globe.gl and other packages use the same Three.js instance
    config.resolve.alias = {
      ...config.resolve.alias,
      'three': path.resolve(__dirname, 'node_modules/three'),
      'three$': path.resolve(__dirname, 'node_modules/three'),
    };
    
    // Handle optional Three.js imports that react-globe.gl tries to use
    // These are experimental features (WebGPU and TSL) that may not be available
    // We use both aliases and NormalModuleReplacementPlugin to catch all import patterns
    const stubWebGPU = path.resolve(__dirname, 'lib/stubs/three-webgpu.js');
    const stubTSL = path.resolve(__dirname, 'lib/stubs/three-tsl.js');
    
    // Set up aliases for both client and server
    config.resolve.alias['three/webgpu'] = stubWebGPU;
    config.resolve.alias['three/tsl'] = stubTSL;
    
    // Also add to fallback for better compatibility
    config.resolve.fallback['three/webgpu'] = stubWebGPU;
    config.resolve.fallback['three/tsl'] = stubTSL;
    
    // Use NormalModuleReplacementPlugin to catch imports from node_modules
    // This handles ESM imports that aliases might miss, including from node_modules
    // Match both exact matches and relative imports
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^three\/webgpu$/,
        stubWebGPU
      ),
      new webpack.NormalModuleReplacementPlugin(
        /^three\/tsl$/,
        stubTSL
      ),
      // Also catch imports from any location
      new webpack.NormalModuleReplacementPlugin(
        /three\/webgpu/,
        stubWebGPU
      ),
      new webpack.NormalModuleReplacementPlugin(
        /three\/tsl/,
        stubTSL
      )
    );
    
    // Ensure the stub files are resolvable
    config.resolve.modules = config.resolve.modules || [];
    config.resolve.modules.push(path.resolve(__dirname, 'lib/stubs'));
    
    return config;
  },
}

module.exports = nextConfig 