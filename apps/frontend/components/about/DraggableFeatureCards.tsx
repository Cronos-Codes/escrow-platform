import React, { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useSpring } from 'framer-motion';

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  color?: string;
}

interface DraggableFeatureCardsProps {
  features: FeatureCard[];
  isLoggedIn: boolean;
  className?: string;
}

export const DraggableFeatureCards: React.FC<DraggableFeatureCardsProps> = ({ 
  features, 
  isLoggedIn,
  className = ""
}) => {
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [cardPositions, setCardPositions] = useState<Record<string, { x: number; y: number }>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Get visible cards based on user status
  const getVisibleCards = useCallback(() => {
    if (isLoggedIn) {
      return features; // Show all cards for logged-in users
    }
    return features.slice(0, 3); // Show limited cards for guests
  }, [features, isLoggedIn]);

  const visibleCards = getVisibleCards();

  const handleDragStart = useCallback((cardId: string) => {
    setDraggedCard(cardId);
  }, []);

  const handleDragEnd = useCallback((cardId: string, info: PanInfo) => {
    setDraggedCard(null);
    
    // Update card position
    setCardPositions(prev => ({
      ...prev,
      [cardId]: {
        x: (prev[cardId]?.x || 0) + info.offset.x,
        y: (prev[cardId]?.y || 0) + info.offset.y
      }
    }));
  }, []);

  const handleCardClick = useCallback((cardId: string) => {
    // Custom click logic - could open modals, navigate, etc.
    console.log(`Card clicked: ${cardId}`);
    
    // Example: Different actions for different cards
    switch (cardId) {
      case 'ai-security':
        // Show AI security demo
        break;
      case 'blockchain':
        // Show blockchain visualization
        break;
      case 'global-compliance':
        // Show compliance details
        break;
      case 'instant-settlement':
        // Show settlement process
        break;
      default:
        break;
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full min-h-[600px] ${className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {visibleCards.map((feature, index) => {
          const x = useMotionValue(cardPositions[feature.id]?.x || 0);
          const y = useMotionValue(cardPositions[feature.id]?.y || 0);
          
          // Spring animation for smooth movement
          const springX = useSpring(x, { stiffness: 300, damping: 30 });
          const springY = useSpring(y, { stiffness: 300, damping: 30 });
          
          // Transform for hover effects
          const scale = useTransform(
            useMotionValue(0),
            [0, 1],
            [1, 1.05]
          );
          
          const rotate = useTransform(
            useMotionValue(0),
            [0, 1],
            [0, 2]
          );

          return (
            <motion.div
              key={feature.id}
              className="group relative cursor-grab active:cursor-grabbing"
              style={{
                x: springX,
                y: springY,
                scale: draggedCard === feature.id ? 1.1 : 1,
                rotate: draggedCard === feature.id ? 5 : 0,
                zIndex: draggedCard === feature.id ? 10 : 1
              }}
              drag
              dragMomentum={false}
              dragElastic={0.1}
              dragConstraints={containerRef}
              onDragStart={() => handleDragStart(feature.id)}
              onDragEnd={(_, info) => handleDragEnd(feature.id, info)}
              onClick={() => handleCardClick(feature.id)}
              whileHover={{ 
                scale: 1.02,
                rotateY: 2,
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.98,
                transition: { duration: 0.1 }
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
            >
              {/* Card Content */}
              <div className="relative p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl backdrop-blur-xl hover:border-yellow-400/30 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-400/10 group-hover:shadow-3xl">
                {/* Icon */}
                <motion.div 
                  className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300"
                  animate={{
                    rotate: draggedCard === feature.id ? [0, 10, -10, 0] : 0
                  }}
                  transition={{ duration: 0.5, repeat: draggedCard === feature.id ? Infinity : 0 }}
                >
                  {feature.icon}
                </motion.div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-slate-300 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect Overlay */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />

                {/* Drag Indicator */}
                <motion.div
                  className="absolute top-4 right-4 w-6 h-6 bg-yellow-400/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={{
                    scale: draggedCard === feature.id ? [1, 1.2, 1] : 1,
                    rotate: draggedCard === feature.id ? [0, 180] : 0
                  }}
                  transition={{ duration: 0.5, repeat: draggedCard === feature.id ? Infinity : 0 }}
                >
                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 2zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 14zm6-8a2 2 0 1 1-.001-4.001A2 2 0 0 1 13 6zm0 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 14z"/>
                  </svg>
                </motion.div>

                {/* Glow Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-400/20 rounded-2xl opacity-0 group-hover:opacity-100"
                  animate={{
                    x: draggedCard === feature.id ? [-100, 100] : 0
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: draggedCard === feature.id ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                />
              </div>

              {/* Shadow */}
              <motion.div
                className="absolute inset-0 bg-black/20 rounded-2xl blur-xl -z-10"
                style={{
                  x: springX,
                  y: springY,
                  scale: draggedCard === feature.id ? 1.1 : 1
                }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center mt-8 text-slate-400 text-sm"
      >
        <p className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          Drag cards to explore • Click for details
        </p>
      </motion.div>
    </div>
  );
};
