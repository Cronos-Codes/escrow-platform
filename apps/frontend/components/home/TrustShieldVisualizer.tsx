import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useDeviceOptimization, useAnimationConfig } from '../../hooks/useDeviceOptimization';

const trustLayers = [
  {
    label: 'Licensed Entity',
    icon: '🏛️',
    color: '#D4AF37',
    description: 'Officially licensed escrow service provider under UAE law',
    certification: 'UAE Commercial License',
  },
  {
    label: 'BAR Certified',
    icon: '⚖️',
    color: '#BFA134',
    description: 'Certified by the Bar Association for legal compliance and neutrality',
    certification: 'Bar Association Registry',
  },
  {
    label: 'KYC/AML Compliant',
    icon: '🔍',
    color: '#A88C2F',
    description: 'Full Know Your Customer and Anti-Money Laundering protocols',
    certification: 'FATF Standards',
  },
  {
    label: 'ISO 27001:2022',
    icon: '🛡️',
    color: '#91782A',
    description: 'International security standard certification for data protection',
    certification: 'ISO Certified',
  },
  {
    label: 'UAE Regulated',
    icon: '⚜️',
    color: '#7A6425',
    description: 'Regulated under UAE Financial Authorities and DIFC courts',
    certification: 'DFSA Compliant',
  },
];

const TrustShieldVisualizer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const device = useDeviceOptimization();
  const animationConfig = useAnimationConfig();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Map scroll progress to layer reveals (each layer appears at specific scroll points)
  const layer1Progress = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);
  const layer2Progress = useTransform(scrollYProgress, [0.25, 0.45], [0, 1]);
  const layer3Progress = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);
  const layer4Progress = useTransform(scrollYProgress, [0.55, 0.75], [0, 1]);
  const layer5Progress = useTransform(scrollYProgress, [0.7, 0.9], [0, 1]);

  const layerProgresses = [
    layer1Progress,
    layer2Progress,
    layer3Progress,
    layer4Progress,
    layer5Progress,
  ];

  return (
    <section
      ref={containerRef}
      className="py-20 sm:py-24 md:py-32 bg-gradient-to-b from-gray-50/90 via-white to-gray-50/90 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-10 text-9xl">🏛️</div>
        <div className="absolute bottom-1/4 right-10 text-9xl">⚖️</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={animationConfig.enableAnimations ? { opacity: 0, y: 30 } : {}}
          whileInView={animationConfig.enableAnimations ? { opacity: 1, y: 0 } : {}}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-block mb-4"
            initial={animationConfig.enableAnimations ? { scale: 0 } : {}}
            whileInView={animationConfig.enableAnimations ? { scale: 1 } : {}}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
          >
            <span className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">
              Trust & Compliance
            </span>
          </motion.div>
          <h2 className={`${device.isMobile ? 'text-3xl sm:text-4xl' : 'text-4xl md:text-5xl'} font-serif font-bold mb-4 text-gray-900`}>
            Trust Built Layer by Layer
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            As a licensed neutral third party, we don't represent buyers or sellers — only the law.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Shield Visualization */}
          <div className="relative flex justify-center order-2 lg:order-1">
            <ShieldSVG layers={trustLayers} layerProgresses={layerProgresses} device={device} />
          </div>

          {/* Layer Details */}
          <div className="space-y-4 md:space-y-6 order-1 lg:order-2">
            {trustLayers.map((layer, index) => (
              <LayerDetail
                key={index}
                layer={layer}
                index={index}
                progress={layerProgresses[index]}
                device={device}
                animationConfig={animationConfig}
              />
            ))}

            {/* Final Quote */}
            <motion.div
              className={`mt-8 p-6 ${device.isLowEnd ? 'bg-gold/10' : 'bg-gradient-to-br from-gold/10 to-gold/5 backdrop-blur-sm'} rounded-xl border-l-4 border-gold`}
              style={{
                opacity: layer5Progress,
              }}
            >
              <blockquote className="text-lg md:text-xl font-serif text-gray-900 italic">
                "We hold ourselves to the highest standards of legal compliance and neutrality."
              </blockquote>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1 text-xs bg-white/80 px-3 py-1 rounded-full border border-gold/20">
                  <span>🏆</span>
                  <span>Trustpilot Rated</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-white/80 px-3 py-1 rounded-full border border-gold/20">
                  <span>⚖️</span>
                  <span>BAR Licensed</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-white/80 px-3 py-1 rounded-full border border-gold/20">
                  <span>🛡️</span>
                  <span>ISO Certified</span>
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface ShieldSVGProps {
  layers: typeof trustLayers;
  layerProgresses: any[];
  device: any;
}

const ShieldSVG = ({ layers, layerProgresses, device }: ShieldSVGProps) => {
  // Move all hooks to top level to avoid "Rendered fewer hooks than expected" error

  // Create scale transforms for all layers unconditionally
  const scale0 = useTransform(layerProgresses[0], [0, 1], [0.8, 1]);
  const scale1 = useTransform(layerProgresses[1], [0, 1], [0.8, 1]);
  const scale2 = useTransform(layerProgresses[2], [0, 1], [0.8, 1]);
  const scale3 = useTransform(layerProgresses[3], [0, 1], [0.8, 1]);
  const scale4 = useTransform(layerProgresses[4], [0, 1], [0.8, 1]);

  const layerScales = [scale0, scale1, scale2, scale3, scale4];

  // Create emblem transform unconditionally
  const emblemScale = useTransform(layerProgresses[4], [0, 1], [0, 1]);

  // Create shine opacity transform unconditionally
  const shineOpacity = useTransform(layerProgresses[4], [0, 1], [0, 0.3]);

  return (
    <div className="relative w-full max-w-md aspect-square">
      <svg viewBox="0 0 200 240" className="w-full h-full">
        <defs>
          {/* Gradient for each layer */}
          {layers.map((layer, i) => (
            <linearGradient key={i} id={`gradient-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={layer.color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={layer.color} stopOpacity="0.5" />
            </linearGradient>
          ))}

          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Shine effect */}
          <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.3" />
            <stop offset="50%" stopColor="white" stopOpacity="0.1" />
            <stop offset="100%" stopColor="white" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Shield layers (from bottom to top) */}
        {layers.map((layer, i) => {
          const size = 40 + i * 12;
          const yOffset = i * 6;
          return (
            <motion.path
              key={i}
              d={`M 100 ${40 - yOffset}
                  L ${100 + size} ${70 + yOffset}
                  L ${100 + size} ${130 + yOffset}
                  Q 100 ${200 + yOffset} ${100 - size} ${130 + yOffset}
                  L ${100 - size} ${70 + yOffset}
                  Z`}
              fill={`url(#gradient-${i})`}
              stroke={layer.color}
              strokeWidth="2"
              filter={!device.isLowEnd ? 'url(#glow)' : undefined}
              style={{
                opacity: layerProgresses[i],
                scale: layerScales[i],
              }}
            />
          );
        })}

        {/* Center emblem - appears last */}
        <motion.g
          style={{
            opacity: layerProgresses[4],
            scale: emblemScale,
          }}
        >
          <circle
            cx="100"
            cy="110"
            r="25"
            fill="white"
            stroke="#D4AF37"
            strokeWidth="3"
          />
          <text
            x="100"
            y="122"
            textAnchor="middle"
            fontSize="28"
            fill="#D4AF37"
          >
            ⚜️
          </text>
        </motion.g>

        {/* Shine overlay */}
        {!device.isLowEnd && (
          <motion.path
            d="M 100 40 L 160 70 L 160 130 Q 100 200 40 130 L 40 70 Z"
            fill="url(#shine)"
            style={{
              opacity: shineOpacity,
            }}
          />
        )}
      </svg>

      {/* Pulsing glow effect */}
      {!device.isLowEnd && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 60%)',
            filter: 'blur(40px)',
            opacity: layerProgresses[4],
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </div>
  );
};

interface LayerDetailProps {
  layer: typeof trustLayers[0];
  index: number;
  progress: any;
  device: any;
  animationConfig: any;
}

const LayerDetail = ({ layer, index, progress, device, animationConfig }: LayerDetailProps) => {
  return (
    <motion.div
      className={`flex items-start gap-4 p-4 md:p-5 rounded-xl ${device.isLowEnd ? 'bg-white' : 'bg-white/80 backdrop-blur-sm'
        } border border-gray-200 hover:border-gold/50 hover:shadow-lg transition-all group cursor-pointer`}
      style={{
        opacity: progress,
        x: useTransform(progress, [0, 1], [-30, 0]),
      }}
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gold/10 rounded-lg text-2xl group-hover:scale-110 transition-transform">
        {layer.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
          {layer.label}
        </h3>
        <p className="text-sm text-gray-600 mb-2 leading-relaxed">
          {layer.description}
        </p>
        <div className="inline-flex items-center gap-2 text-xs text-gold">
          <span className="font-medium">{layer.certification}</span>
        </div>
      </div>

      {/* Progress indicator */}
      <motion.div
        className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-gold flex items-center justify-center"
        style={{
          backgroundColor: useTransform(progress, [0, 1], ['transparent', layer.color]),
        }}
      >
        <motion.span
          className="text-white text-sm font-bold"
          style={{
            opacity: progress,
          }}
        >
          ✓
        </motion.span>
      </motion.div>
    </motion.div>
  );
};

export default TrustShieldVisualizer;


