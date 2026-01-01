import React, { useRef, useEffect, useState } from 'react';
// Placeholder: In production, import Globe from 'globe.gl' or Three.js logic
// import Globe from 'globe.gl';

const mockData = [
  { id: 'TX001', region: 'UAE', type: 'commodity', amount: 1200000, status: 'active', lat: 25.2048, lng: 55.2708 },
  { id: 'TX002', region: 'UK', type: 'property', amount: 800000, status: 'active', lat: 51.5074, lng: -0.1278 },
  { id: 'TX003', region: 'India', type: 'service', amount: 50000, status: 'active', lat: 28.6139, lng: 77.209 },
];

const assetColors = {
  commodity: '#D4AF37',
  property: '#1C2A39',
  service: '#28A745',
};

const GlobalHeatmap = () => {
  const [adaMode, setAdaMode] = useState(false);
  // const globeRef = useRef();

  // useEffect(() => {
  //   if (globeRef.current && !adaMode) {
  //     // Initialize Globe.gl or Three.js logic here
  //   }
  // }, [adaMode]);

  return (
    <section className="py-16 bg-gradient-to-br from-[#1C2A39]/90 to-[#141414] text-white">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 min-h-[400px] flex items-center justify-center relative">
          {/* 3D Globe Placeholder */}
          {!adaMode ? (
            <div className="w-full h-[400px] bg-black/40 rounded-full flex items-center justify-center relative shadow-gold-glow">
              <span className="absolute top-4 left-4 text-gold font-bold">Live Escrow Globe (3D)</span>
              {/* Pulsing markers for mock data */}
              {mockData.map((tx, i) => (
                <div
                  key={tx.id}
                  className="absolute"
                  style={{ left: `${30 + i * 60}px`, top: `${120 + i * 40}px` }}
                  title={`${tx.region}: $${tx.amount.toLocaleString()} (${tx.type})`}
                >
                  <span className="block w-4 h-4 rounded-full animate-pulse" style={{ background: assetColors[tx.type as keyof typeof assetColors] }}></span>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-[400px] bg-white/10 rounded-xl p-6 overflow-auto">
              <table className="w-full text-left text-xs text-[#1C2A39]">
                <thead>
                  <tr className="border-b border-gold/30">
                    <th>Region</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.map(tx => (
                    <tr key={tx.id} className="border-b border-gold/10">
                      <td>{tx.region}</td>
                      <td>{tx.type}</td>
                      <td>${tx.amount.toLocaleString()}</td>
                      <td>{tx.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button
            className="absolute bottom-4 right-4 bg-gold text-black px-4 py-2 rounded-full shadow hover:bg-gold/90 transition-colors text-xs font-semibold"
            aria-label="Toggle accessibility table view"
            onClick={() => setAdaMode(v => !v)}
          >
            {adaMode ? 'Show Globe' : 'ADA Table View'}
          </button>
        </div>
        <div className="flex-1 flex flex-col gap-6">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2 text-gold">Global Escrow Coverage</h2>
          <p className="text-lg text-white/80 mb-4">Live, real-time visualization of all active escrow transactions by region and asset type. Gold for commodities, navy for property, green for services.</p>
          <button className="bg-gold text-black px-6 py-3 rounded-full font-semibold shadow hover:bg-gold/90 transition-colors w-max" aria-label="See Escrow Coverage by Region">
            See Escrow Coverage by Region
          </button>
        </div>
      </div>
    </section>
  );
};

export default GlobalHeatmap; 