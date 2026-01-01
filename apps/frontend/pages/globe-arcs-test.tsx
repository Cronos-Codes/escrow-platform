/**
 * Globe Arcs Test Page
 * 
 * Test page for GlobeWithArcs component based on react-globe.gl random arcs example
 */

import React, { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import HeroGlobe from '../components/home/HeroGlobe';

// Dynamically import to avoid SSR issues
const HeroGlobeDynamic = dynamic(() => import('../components/home/HeroGlobe'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center text-gold/50">
      <div className="animate-pulse">Loading Globe...</div>
    </div>
  ),
});

const GlobeArcsTest: React.FC = () => {
  const [mode, setMode] = useState<'hero' | 'widget'>('hero');
  const [enableCursorRotation, setEnableCursorRotation] = useState(true);
  const [enableAutoRotation, setEnableAutoRotation] = useState(true);
  const [clickedCity, setClickedCity] = useState<string | null>(null);

  return (
    <>
      <Head>
        <title>Globe Arcs Test - react-globe.gl Random Arcs</title>
        <meta name="description" content="Test page for GlobeWithArcs component" />
      </Head>

      {/* Globe - Full Screen Background */}
      <div className="fixed inset-0 z-0">
        <HeroGlobeDynamic
          mode={mode}
          enableCursorRotation={enableCursorRotation}
          enableAutoRotation={enableAutoRotation}
          onCityClick={(cityId) => {
            setClickedCity(cityId);
            console.log('City clicked:', cityId);
          }}
        />
      </div>

      {/* Scrollable Content Overlay */}
      <div className="relative z-10 min-h-[200vh] bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900">
        {/* Debug Controls Panel */}
        <div className="sticky top-4 left-4 z-20 max-w-md">
          <div className="bg-black/90 backdrop-blur-md border border-gold/30 rounded-lg p-4 shadow-lg">
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
                    className={`px-4 py-2 rounded transition-colors ${
                      mode === 'hero'
                        ? 'bg-gold text-black'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    Hero
                  </button>
                  <button
                    onClick={() => setMode('widget')}
                    className={`px-4 py-2 rounded transition-colors ${
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
                <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableCursorRotation}
                    onChange={(e) => setEnableCursorRotation(e.target.checked)}
                    className="w-4 h-4 text-gold rounded"
                  />
                  Cursor Rotation
                </label>
                <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableAutoRotation}
                    onChange={(e) => setEnableAutoRotation(e.target.checked)}
                    className="w-4 h-4 text-gold rounded"
                  />
                  Auto Rotation
                </label>
              </div>

              {/* Clicked City Display */}
              {clickedCity && (
                <div className="mt-4 p-3 bg-gold/20 border border-gold/50 rounded">
                  <p className="text-gold text-sm font-semibold">Last Clicked:</p>
                  <p className="text-white text-xs mt-1">{clickedCity}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Test Content Sections */}
        <div className="container mx-auto px-4 py-20">
          {/* Section 1 - Introduction */}
          <section className="min-h-screen flex items-center justify-center">
            <div className="max-w-4xl text-center text-white">
              <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gold to-yellow-400">
                Globe Arcs Test
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Testing GlobeWithArcs component based on{' '}
                <a 
                  href="https://vasturiano.github.io/react-globe.gl/example/random-arcs/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gold hover:underline"
                >
                  react-globe.gl random arcs example
                </a>
              </p>
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 border border-gold/30">
                <h2 className="text-2xl font-semibold text-gold mb-4">Test Checklist</h2>
                <ul className="text-left space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-gold">✓</span>
                    <span>Globe renders with Earth texture</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold">✓</span>
                    <span>8 animated arcs connecting cities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold">✓</span>
                    <span>10 city markers with pulsing animation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold">✓</span>
                    <span>Arcs have traveling pulse effect</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold">✓</span>
                    <span>Cursor movement rotates globe (desktop)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold">✓</span>
                    <span>Auto-rotation when cursor idle</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold">✓</span>
                    <span>Page scrolls smoothly (no scroll lock)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold">✓</span>
                    <span>City hover shows tooltip</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold">✓</span>
                    <span>City click works in widget mode</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 - Arc Details */}
          <section className="min-h-screen flex items-center justify-center">
            <div className="max-w-4xl text-center text-white">
              <h2 className="text-4xl font-bold mb-6 text-gold">
                Arc Connections
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                The globe shows 8 animated arcs connecting major cities:
              </p>
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 border border-gold/30 text-left">
                <ul className="space-y-2 text-gray-300">
                  <li>• Dubai ↔ London</li>
                  <li>• Dubai ↔ Singapore</li>
                  <li>• London ↔ New York</li>
                  <li>• Singapore ↔ Tokyo</li>
                  <li>• Nairobi ↔ Dubai</li>
                  <li>• Lagos ↔ London</li>
                  <li>• Johannesburg ↔ Sydney</li>
                  <li>• Tokyo ↔ New York</li>
                </ul>
                <p className="mt-4 text-sm text-gray-400">
                  Each arc has a traveling pulse animation with staggered start times for an organic look.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 - Cities */}
          <section className="min-h-screen flex items-center justify-center">
            <div className="max-w-4xl text-center text-white">
              <h2 className="text-4xl font-bold mb-6 text-gold">
                City Markers
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                10 cities are displayed with pulsing markers:
              </p>
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 border border-gold/30">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
                  {['Nairobi', 'Kampala', 'Lagos', 'Johannesburg', 'Dubai', 'London', 'New York', 'Singapore', 'Tokyo', 'Sydney'].map((city) => (
                    <div key={city} className="text-gray-300">
                      <span className="text-gold">•</span> {city}
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-gray-400 text-center">
                  Hover over cities to see transaction details. Click cities in widget mode.
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="min-h-[50vh] flex items-center justify-center">
            <div className="text-center text-white">
              <p className="text-lg text-gray-400 mb-4">
                End of test content. Scroll back up to test again.
              </p>
              <p className="text-sm text-gray-500">
                Check browser console for city click events
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default GlobeArcsTest;

