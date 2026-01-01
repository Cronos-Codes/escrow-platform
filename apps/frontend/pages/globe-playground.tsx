/**
 * Globe Playground - Sandbox Test Page
 * 
 * This is a dedicated test page for debugging and developing the Globe component
 * independently before reintegration into the home page.
 * 
 * Features:
 * - Full-screen globe rendering
 * - Scrollable page content to test scroll compatibility
 * - Cursor interactivity testing
 * - Performance monitoring
 */

import React, { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import GlobeCore from '../components/globe/GlobeCore';

// Dynamically import to avoid SSR issues
const GlobeCoreDynamic = dynamic(() => import('../components/globe/GlobeCore'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center text-gold/50">
      Loading Globe...
    </div>
  ),
});

const GlobePlayground: React.FC = () => {
  const [mode, setMode] = useState<'hero' | 'widget'>('hero');
  const [enableCursorRotation, setEnableCursorRotation] = useState(true);
  const [enableAutoRotation, setEnableAutoRotation] = useState(true);
  const [enableScrollEffects, setEnableScrollEffects] = useState(false);

  return (
    <>
      <Head>
        <title>Globe Playground - Debug & Test</title>
        <meta name="description" content="Globe component sandbox for debugging and development" />
      </Head>

      {/* Globe Core - Full Screen */}
      <div className="fixed inset-0 z-0">
        <GlobeCoreDynamic
          mode={mode}
          enableCursorRotation={enableCursorRotation}
          enableAutoRotation={enableAutoRotation}
          enableScrollEffects={enableScrollEffects}
        />
      </div>

      {/* Scrollable Content Overlay - Tests scroll compatibility */}
      <div className="relative z-10 min-h-[200vh] bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900">
        {/* Debug Controls Panel */}
        <div className="sticky top-4 left-4 z-20 max-w-md">
          <div className="bg-black/80 backdrop-blur-md border border-gold/30 rounded-lg p-4 shadow-lg">
            <h2 className="text-gold font-bold text-lg mb-4">Globe Controls</h2>
            
            <div className="space-y-3">
              {/* Mode Toggle */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Mode:
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode('hero')}
                    className={`px-4 py-2 rounded ${
                      mode === 'hero'
                        ? 'bg-gold text-black'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    Hero
                  </button>
                  <button
                    onClick={() => setMode('widget')}
                    className={`px-4 py-2 rounded ${
                      mode === 'widget'
                        ? 'bg-gold text-black'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    Widget
                  </button>
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-white text-sm">
                  <input
                    type="checkbox"
                    checked={enableCursorRotation}
                    onChange={(e) => setEnableCursorRotation(e.target.checked)}
                    className="w-4 h-4 text-gold rounded"
                  />
                  Cursor Rotation
                </label>
                <label className="flex items-center gap-2 text-white text-sm">
                  <input
                    type="checkbox"
                    checked={enableAutoRotation}
                    onChange={(e) => setEnableAutoRotation(e.target.checked)}
                    className="w-4 h-4 text-gold rounded"
                  />
                  Auto Rotation
                </label>
                <label className="flex items-center gap-2 text-white text-sm">
                  <input
                    type="checkbox"
                    checked={enableScrollEffects}
                    onChange={(e) => setEnableScrollEffects(e.target.checked)}
                    className="w-4 h-4 text-gold rounded"
                  />
                  Scroll Effects
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Test Content Sections */}
        <div className="container mx-auto px-4 py-20">
          {/* Section 1 */}
          <section className="min-h-screen flex items-center justify-center">
            <div className="max-w-4xl text-center text-white">
              <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gold to-yellow-400">
                Globe Playground
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                This page tests the isolated Globe component with full scroll compatibility.
                Scroll down to verify the page scrolls smoothly while the globe remains interactive.
              </p>
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 border border-gold/30">
                <h2 className="text-2xl font-semibold text-gold mb-4">Test Checklist</h2>
                <ul className="text-left space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-gold">✓</span>
                    <span>Globe renders correctly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold">✓</span>
                    <span>Cursor movement rotates globe (desktop)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold">✓</span>
                    <span>Page scrolls smoothly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold">✓</span>
                    <span>No WebGL errors in console</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold">✓</span>
                    <span>No memory leaks</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 - Scroll Test */}
          <section className="min-h-screen flex items-center justify-center">
            <div className="max-w-4xl text-center text-white">
              <h2 className="text-4xl font-bold mb-6 text-gold">
                Scroll Compatibility Test
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                If you can read this, scrolling is working correctly. The globe should remain
                visible and interactive in the background.
              </p>
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 border border-gold/30">
                <h3 className="text-xl font-semibold text-gold mb-4">Fixed Issues</h3>
                <ul className="text-left space-y-2 text-gray-300">
                  <li>• Pointer events properly disabled in hero mode</li>
                  <li>• R3F event system disabled to prevent scroll hijacking</li>
                  <li>• WebGL context cleanup on unmount</li>
                  <li>• Animation frames properly cancelled</li>
                  <li>• Passive event listeners for scroll compatibility</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 - Performance Info */}
          <section className="min-h-screen flex items-center justify-center">
            <div className="max-w-4xl text-center text-white">
              <h2 className="text-4xl font-bold mb-6 text-gold">
                Performance Metrics
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Monitor browser DevTools for:
              </p>
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 border border-gold/30 text-left">
                <ul className="space-y-2 text-gray-300">
                  <li>• FPS should remain stable (~60fps)</li>
                  <li>• Memory usage should not continuously increase</li>
                  <li>• No WebGL context lost warnings</li>
                  <li>• No shader compilation errors</li>
                  <li>• Smooth cursor rotation without jank</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="min-h-[50vh] flex items-center justify-center">
            <div className="text-center text-white">
              <p className="text-lg text-gray-400">
                End of test content. Scroll back up to test again.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default GlobePlayground;

