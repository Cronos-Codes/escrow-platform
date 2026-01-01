/**
 * Wrapper for fluid simulation script that handles canvas initialization properly
 * This fixes the race condition where script tries to access canvas before it exists
 */

(function() {
  'use strict';

  // Wait for canvas to be available
  function waitForCanvas(maxAttempts = 50, interval = 100) {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const checkCanvas = () => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          resolve(canvas);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkCanvas, interval);
        } else {
          reject(new Error('Canvas not found after maximum attempts'));
        }
      };
      
      checkCanvas();
    });
  }

  // Initialize fluid simulation with config
  async function initializeFluidSimulation(canvas, userConfig) {
    // Set config on window before script loads
    if (userConfig) {
      window.fluidConfig = userConfig;
    }

    // Load the actual script
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/fluid/script.js';
      script.async = false; // Load synchronously to apply patches
      
      script.onload = () => {
        // Patch the script's canvas access after it loads
        // The script tries to access canvas immediately, so we need to ensure it exists
        try {
          // The script should now have initialized
          // Apply config if it wasn't applied during load
          if (window.fluidConfig && window.config) {
            Object.assign(window.config, {
              COLORFUL: window.fluidConfig.COLORFUL !== undefined ? window.fluidConfig.COLORFUL : window.config.COLORFUL,
              BLOOM: window.fluidConfig.BLOOM !== undefined ? window.fluidConfig.BLOOM : window.config.BLOOM,
              SUNRAYS: window.fluidConfig.SUNRAYS !== undefined ? window.fluidConfig.SUNRAYS : window.config.SUNRAYS,
              BACK_COLOR: window.fluidConfig.BACK_COLOR || window.config.BACK_COLOR,
            });
            
            // Update display keywords if config changed
            if (window.updateKeywords) {
              window.updateKeywords();
            }
          }
          
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load fluid simulation script'));
      };
      
      document.body.appendChild(script);
    });
  }

  // Export initialization function
  window.initFluidSimulationWrapper = async function(userConfig) {
    try {
      const canvas = await waitForCanvas();
      await initializeFluidSimulation(canvas, userConfig);
      window.fluidInitialized = true;
      return true;
    } catch (error) {
      console.error('Fluid simulation initialization failed:', error);
      window.fluidInitialized = false;
      return false;
    }
  };

  // Export resize function if needed
  window.resizeFluidCanvas = function() {
    if (window.resizeCanvas && typeof window.resizeCanvas === 'function') {
      window.resizeCanvas();
    }
  };
})();

