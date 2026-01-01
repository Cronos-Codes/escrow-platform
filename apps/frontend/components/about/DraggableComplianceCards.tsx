import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence, useScroll, useInView } from 'framer-motion';
import { useSpring } from 'framer-motion';

// Advanced device detection and optimization
const useDeviceOptimization = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isLowEnd: false,
    supportsTouch: false,
    reducedMotion: false,
    pixelDensity: 1
  });

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // More sophisticated mobile detection
      const isMobileDevice = width < 768 || /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTabletDevice = (width >= 768 && width < 1024) || /iPad/i.test(userAgent);
      
      // Low-end device detection
      const isLowEndDevice = (
        navigator.hardwareConcurrency <= 2 || 
        (navigator as any).deviceMemory <= 2 ||
        width < 375 ||
        /Android.*[2-5]\.|iPhone.*OS [5-9]_/i.test(userAgent)
      );

      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      setDeviceInfo({
        isMobile: isMobileDevice,
        isTablet: isTabletDevice,
        isLowEnd: isLowEndDevice,
        supportsTouch: isTouchDevice,
        reducedMotion: prefersReducedMotion,
        pixelDensity: window.devicePixelRatio || 1
      });
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  return deviceInfo;
};

interface ComplianceCard {
  id: string;
  title: string;
  subtitle?: string; // Short descriptive subtitle
  description: string; // Initial visible info
  details: string; // Revealed after dragging
  extendedDetails: string; // Additional details for full expansion
  icon: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
}

interface DraggableComplianceCardsProps {
  complianceItems: ComplianceCard[];
  isLoggedIn: boolean;
  className?: string;
}

export const DraggableComplianceCards: React.FC<DraggableComplianceCardsProps> = ({ 
  complianceItems, 
  isLoggedIn,
  className = ""
}) => {
  // Advanced device optimization
  const device = useDeviceOptimization();
  
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  // Removed cardPositions - cards don't move, only expand height
  const [selectedCompliance, setSelectedCompliance] = useState<string | null>(null);
  const [revealLevel, setRevealLevel] = useState<Record<string, 'initial' | 'revealed' | 'expanded'>>({}); // Progressive reveal
  

  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isMouseInContainer, setIsMouseInContainer] = useState(false);
  const [scrollTriggeredReorganization, setScrollTriggeredReorganization] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({ width: 'auto', height: 'auto' });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const isInView = useInView(containerRef, { once: false, margin: "-100px" });
  
  // Adaptive scroll effects based on device capabilities
  const cardScale = useTransform(
    scrollYProgress, 
    [0, 0.2, 0.8, 1], 
    device.isLowEnd || device.reducedMotion 
      ? [1, 1, 1, 1] // No scaling for low-end devices
      : device.isMobile 
        ? [0.99, 1, 1, 0.99] // Minimal scaling for mobile
        : [0.98, 1, 1, 0.98] // Full effect for desktop
  );
  
  const containerY = useTransform(
    scrollYProgress, 
    [0, 1], 
    device.isLowEnd || device.reducedMotion
      ? [0, 0] // No movement for low-end devices
      : device.isMobile 
        ? [0, -5] // Reduced movement for mobile
        : [0, -10] // Full movement for desktop
  );

  const handleDragStart = useCallback((cardId: string) => {
    setDraggedCard(cardId);
  }, []);

  const handleDragEnd = useCallback((cardId: string, info: PanInfo) => {
    setDraggedCard(null);
    
    // Calculate drag distance
    const dragDistance = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
    const currentLevel = revealLevel[cardId] || 'initial';
    
    // Mobile/Touch optimization: simpler interaction model
    if (device.isMobile || device.supportsTouch) {
      // More lenient thresholds for touch devices
      if (dragDistance > 50 && currentLevel === 'initial') {
        setRevealLevel(prev => ({ ...prev, [cardId]: 'revealed' }));
      } else if (dragDistance > 80 && currentLevel === 'revealed') {
        setRevealLevel(prev => ({ ...prev, [cardId]: 'expanded' }));
      }
      return;
    }
    
    // Desktop behavior - progressive reveal with auto-close
    if (dragDistance > 100 && currentLevel === 'initial') {
      setRevealLevel(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(key => {
          if (key !== cardId && newState[key] === 'revealed') {
            newState[key] = 'initial';
          }
        });
        return { ...newState, [cardId]: 'revealed' };
      });
    } else if (dragDistance > 150 && currentLevel === 'revealed') {
      setRevealLevel(prev => ({
        ...prev,
        [cardId]: 'expanded'
      }));
    }
  }, [revealLevel, device]);

  const handleCardClick = useCallback((cardId: string) => {
    // Close other expanded details when clicking a card
    if (selectedCompliance && selectedCompliance !== cardId) {
      setSelectedCompliance(null);
      setTimeout(() => setSelectedCompliance(cardId), 200);
    } else {
      setSelectedCompliance(selectedCompliance === cardId ? null : cardId);
    }
  }, [selectedCompliance]);

  const handleCardHover = useCallback((cardId: string) => {
    // Skip hover on mobile/touch devices for performance
    if (device.isMobile || device.supportsTouch || device.isLowEnd) return;
    
    // Clean hover response - only when mouse is in container
    if (!isMouseInContainer) return;
    
    setHoveredCard(cardId);
    // Gentle auto-minimize for better UX - longer delay for stability
    if (!Object.values(revealLevel).includes('expanded')) {
      const timeoutId = setTimeout(() => {
        setRevealLevel(prev => {
          const newState = { ...prev };
          Object.keys(newState).forEach(key => {
            if (key !== cardId && newState[key] === 'revealed') {
              newState[key] = 'initial';
            }
          });
          return newState;
        });
      }, 600);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isMouseInContainer, revealLevel, device]);

  const handleCardHoverEnd = useCallback(() => {
    setHoveredCard(null);
  }, []);

  // Container mouse handlers
  const handleContainerMouseEnter = useCallback(() => {
    setIsMouseInContainer(true);
  }, []);

  const handleContainerMouseLeave = useCallback(() => {
    setIsMouseInContainer(false);
    setHoveredCard(null);
    
    // Professional cleanup when mouse leaves - smooth and predictable
    if (!scrollTriggeredReorganization) {
      setScrollTriggeredReorganization(true);
      
      // Gracefully reset revealed cards only
      setRevealLevel(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(key => {
          if (newState[key] === 'revealed') {
            newState[key] = 'initial';
          }
        });
        return newState;
      });
      
      // No position changes needed - cards stay in place
      
      // Reset container height to base size
      setTimeout(() => {
        setContainerDimensions({ width: 'auto', height: '400px' });
      }, device.isMobile ? 50 : 100);
      
      // Quick reorganization flag reset
      setTimeout(() => setScrollTriggeredReorganization(false), device.isMobile ? 300 : 500);
    }
  }, [scrollTriggeredReorganization, complianceItems]);

  // Device-optimized scroll-responsive layout
  const getScrollResponsiveLayout = useCallback((index: number, progress: number) => {
    // No scroll effects for low-end devices or reduced motion
    if (device.isLowEnd || device.reducedMotion) {
      return { scale: 1, rotate: 0, z: 0 };
    }
    
    // Minimal effects for mobile
    if (device.isMobile) {
      return {
        scale: 1,
        rotate: 0,
        z: 0
      };
    }
    
    // Full effects for desktop
    const effectIntensity = isMouseInContainer ? 0.6 : 0.15;
    
    if (progress < 0.1) {
      return {
        scale: 0.99 + (0.01 * effectIntensity),
        rotate: 0,
        z: 0
      };
    } else if (progress > 0.9) {
      return {
        scale: 0.98 + (0.02 * effectIntensity),
        rotate: (index % 2 === 0 ? 0.3 : -0.3) * effectIntensity,
        z: index * 0.5 * effectIntensity
      };
    } else {
      return {
        scale: 1,
        rotate: Math.sin(progress * Math.PI + index) * 0.1 * effectIntensity,
        z: Math.sin(progress * Math.PI * 2 + index) * 0.5 * effectIntensity
      };
    }
  }, [isMouseInContainer, device]);

  // Calculate dynamic container HEIGHT only - width stays fixed
  const calculateContainerSize = useCallback(() => {
    if (!containerRef.current) return;

    // Base dimensions - width NEVER changes
    const baseHeight = 400; // min-h-[400px]
    let containerHeight = baseHeight;

    // Only expand HEIGHT based on revealed/expanded cards
    const hasRevealedCards = Object.values(revealLevel).some(level => level === 'revealed');
    const hasExpandedCards = Object.values(revealLevel).some(level => level === 'expanded');

    if (hasExpandedCards) {
      // Significant height expansion for expanded cards
      containerHeight = baseHeight * 1.6;
    } else if (hasRevealedCards) {
      // Moderate height expansion for revealed cards
      containerHeight = baseHeight * 1.3;
    }

    // Update container dimensions - ONLY height changes
    setContainerDimensions({
      width: 'auto', // Always auto width
      height: `${containerHeight}px`
    });
  }, [revealLevel]);

  // Update container size when card reveal states change
  useEffect(() => {
    calculateContainerSize();
  }, [calculateContainerSize]);

    return (
    <motion.div 
      ref={containerRef}
      className={`relative w-full ${device.isMobile ? 'overflow-hidden' : 'overflow-visible'} ${className}`}
      style={{
        y: containerY,
        scale: cardScale,
        height: containerDimensions.height,
        minHeight: '400px'
      }}
      animate={{
        height: containerDimensions.height
      }}
      transition={{ 
        duration: device.isMobile ? 0.3 : 0.4, 
        ease: "easeOut" 
      }}
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
    >
             <motion.div 
         className={`grid relative ${
           device.isMobile 
             ? 'grid-cols-1 gap-4' 
             : device.isTablet 
               ? 'grid-cols-2 gap-5' 
               : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
         }`}
         animate={{
           rotateX: (device.isLowEnd || device.reducedMotion) ? 0 : (scrollTriggeredReorganization ? 0.2 : 0),
           rotateY: (device.isLowEnd || device.reducedMotion) ? 0 : (scrollTriggeredReorganization ? 0.1 : 0)
         }}
         transition={{ 
           duration: device.isMobile ? 0.2 : 0.4, 
           ease: "easeOut" 
         }}
       >
         {complianceItems.map((item, index) => {
           // No position tracking needed - cards stay in grid positions

           const currentRevealLevel = revealLevel[item.id] || 'initial';
           
           // Get scroll-responsive layout for this card
           const scrollLayout = getScrollResponsiveLayout(index, scrollYProgress.get());

          return (
            <motion.div
              key={item.id}
              className="group relative cursor-grab active:cursor-grabbing"
                                           style={{
                scale: device.isLowEnd || device.reducedMotion
                  ? 1 // No scaling for low-end devices
                  : draggedCard === item.id 
                    ? (device.isMobile ? 1.02 : 1.05)
                    : (currentRevealLevel === 'initial' ? 0.98 : 1) * scrollLayout.scale,
                rotate: device.isLowEnd || device.reducedMotion 
                  ? 0 // No rotation for low-end devices
                  : draggedCard === item.id 
                    ? (device.isMobile ? 1 : 2) 
                    : scrollLayout.rotate,
                zIndex: draggedCard === item.id ? 10 : 1,
                rotateX: (device.isLowEnd || device.reducedMotion) ? 0 : (scrollTriggeredReorganization ? 0.5 : 0),
                rotateY: (device.isLowEnd || device.reducedMotion) ? 0 : (scrollTriggeredReorganization ? 0.3 : 0)
              }}
              drag
              dragMomentum={false}
              dragElastic={device.isMobile ? 0.15 : 0.2}
              dragConstraints={device.isMobile ? { left: -100, right: 100, top: -100, bottom: 100 } : { left: -150, right: 150, top: -150, bottom: 150 }}
              onDragStart={() => handleDragStart(item.id)}
              onDragEnd={(_, info) => handleDragEnd(item.id, info)}
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick(item.id);
              }}
              onHoverStart={device.isMobile || device.supportsTouch ? undefined : () => handleCardHover(item.id)}
              onHoverEnd={device.isMobile || device.supportsTouch ? undefined : handleCardHoverEnd}
              whileHover={device.isMobile || device.supportsTouch || device.isLowEnd ? {} : { 
                scale: 1.01,
                rotateY: 0.5,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              whileTap={{ 
                scale: device.isLowEnd ? 1 : (device.isMobile ? 0.98 : 0.99),
                transition: { 
                  duration: device.isMobile ? 0.1 : 0.15, 
                  ease: "easeOut" 
                }
              }}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ 
                opacity: isInView ? 1 : 0.8, 
                y: 0,
                scale: 1,
                x: 0,
                rotate: 0
              }}
              transition={{ 
                type: "spring",
                stiffness: 280,
                damping: 35,
                opacity: { duration: 0.4, ease: "easeOut" },
                scale: { duration: 0.3, ease: "easeOut" },
                delay: index * 0.02
              }}
            >
                                           {/* Card Content - Fixed width, variable height */}
              <div className={`relative w-full ${device.isMobile ? 'p-4' : 'p-6'} bg-gradient-to-br ${item.gradientFrom} ${item.gradientTo} border-2 ${item.borderColor} rounded-2xl ${device.isLowEnd ? '' : 'backdrop-blur-xl'} ${device.isMobile || device.isLowEnd ? 'shadow-md' : 'hover:shadow-xl shadow-lg'} transition-all duration-${device.isMobile ? '250' : '300'} overflow-hidden min-h-[${device.isMobile ? '180' : '200'}px]`}>
                
                {/* Descriptive Preview State */}
                {currentRevealLevel === 'initial' && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-slate-900/60 to-black/70 backdrop-blur-sm flex flex-col justify-center p-4 z-10 rounded-2xl"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: hoveredCard === item.id ? 0.8 : 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center space-y-3">
                      {/* Large Icon */}
                                             <motion.div
                         className={`${device.isMobile ? 'text-4xl' : 'text-5xl'} mb-1`}
                         animate={device.isLowEnd || device.reducedMotion ? {} : { 
                           scale: hoveredCard === item.id ? [1, 1.03, 1] : [1, 1.01, 1],
                           rotate: hoveredCard === item.id ? [0, 1, -1, 0] : 0
                         }}
                         transition={device.isLowEnd || device.reducedMotion ? {} : { 
                           scale: { duration: device.isMobile ? 4 : 3, repeat: Infinity, ease: "easeInOut" },
                           rotate: { duration: device.isMobile ? 5 : 4, repeat: Infinity, ease: "easeInOut" }
                         }}
                       >
                        {item.icon}
                      </motion.div>
                      
                      {/* Title */}
                      <div>
                                                 <h3 className={`${device.isMobile ? 'text-base' : 'text-lg'} font-bold ${item.textColor} mb-1`}>
                           {item.title}
                         </h3>
                         {item.subtitle && (
                           <p className={`text-slate-400 ${device.isMobile ? 'text-xs' : 'text-xs'} mb-2 font-medium`}>
                             {item.subtitle}
                           </p>
                         )}
                         <p className={`text-slate-300 ${device.isMobile ? 'text-xs' : 'text-sm'} leading-relaxed`}>
                           {item.description}
                         </p>
                      </div>

                      {/* Interactive Hint */}
                      <motion.div
                        className="pt-2 border-t border-slate-600/30"
                        animate={device.isLowEnd || device.reducedMotion ? { opacity: 0.8 } : { 
                          opacity: [0.6, 1, 0.6],
                          y: [0, -1, 0]
                        }}
                        transition={device.isLowEnd || device.reducedMotion ? {} : { 
                          duration: device.isMobile ? 4 : 3, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                      >
                        <div className={`text-xs ${item.textColor} font-medium mb-1`}>
                          Interactive Compliance Details
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                          <span>{device.isMobile ? 'Tap to explore details' : 'Drag to explore certification details'}</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                                  {/* Progressive Revealed Content */}
                 <motion.div
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ 
                     opacity: currentRevealLevel !== 'initial' ? 1 : 0,
                     scale: currentRevealLevel !== 'initial' ? 1 : 0.9
                   }}
                   transition={{ duration: 0.8, delay: currentRevealLevel !== 'initial' ? 0.2 : 0 }}
                   className="relative z-5"
                 >
                   {/* Icon with Enhanced Animation */}
                   <motion.div 
                     className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300"
                     animate={{
                       rotate: draggedCard === item.id ? [0, 10, -10, 0] : 0,
                       y: currentRevealLevel === 'expanded' ? [0, -5, 0] : 0
                     }}
                     transition={{ 
                       rotate: { duration: 0.5, repeat: draggedCard === item.id ? Infinity : 0 },
                       y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                     }}
                   >
                     {item.icon}
                   </motion.div>

                   {/* Title with Gradient Text */}
                   <motion.h3 
                     className={`text-xl font-bold mb-3 bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent group-hover:from-white group-hover:to-yellow-400 transition-all duration-300`}
                     animate={{ scale: currentRevealLevel === 'expanded' ? [1, 1.02, 1] : 1 }}
                     transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                   >
                     {item.title}
                   </motion.h3>

                   {/* Basic Description - Always shown after first reveal */}
                   {currentRevealLevel !== 'initial' && (
                     <motion.p 
                       className="text-slate-200 leading-relaxed mb-4 text-sm"
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ duration: 0.6, delay: 0.3 }}
                     >
                       {item.description}
                     </motion.p>
                   )}

                   {/* Detailed Information - Shown after significant drag */}
                   {currentRevealLevel === 'revealed' && (
                     <motion.div
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: "auto" }}
                       transition={{ duration: 0.8, delay: 0.4 }}
                       className="overflow-hidden"
                     >
                       <div className={`p-4 rounded-lg bg-gradient-to-r from-slate-800/30 to-slate-900/30 border-l-4 ${item.borderColor} mb-4`}>
                         <p className="text-slate-300 text-sm leading-relaxed">
                           {item.details}
                         </p>
                         <div className={`text-xs ${item.textColor} mt-2 font-medium`}>
                           Drag further for complete details
                         </div>
                       </div>
                     </motion.div>
                   )}

                   {/* Extended Details - Shown after maximum drag */}
                   {currentRevealLevel === 'expanded' && (
                     <motion.div
                       initial={{ opacity: 0, height: 0, scale: 0.95 }}
                       animate={{ opacity: 1, height: "auto", scale: 1 }}
                       transition={{ duration: 1, delay: 0.5 }}
                       className="overflow-hidden"
                     >
                       <div className={`p-4 rounded-lg bg-gradient-to-r ${item.gradientFrom}/20 ${item.gradientTo}/20 border ${item.borderColor} mb-4`}>
                         <div className="flex items-center mb-2">
                           <div className={`w-2 h-2 ${item.accentColor} rounded-full mr-2 animate-pulse`}></div>
                           <span className={`text-xs font-bold ${item.textColor} uppercase tracking-wider`}>
                             Complete Details
                           </span>
                         </div>
                         <p className="text-slate-300 text-sm leading-relaxed mb-3">
                           {item.details}
                         </p>
                         <div className="border-t border-slate-600/30 pt-3">
                           <p className="text-slate-400 text-xs leading-relaxed">
                             {item.extendedDetails}
                           </p>
                         </div>
                       </div>
                     </motion.div>
                   )}

                   {/* Click for More Details */}
                   {currentRevealLevel === 'expanded' && (
                     <AnimatePresence>
                       {selectedCompliance === item.id && (
                         <motion.div
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: "auto" }}
                           exit={{ opacity: 0, height: 0 }}
                           transition={{ duration: 0.5 }}
                           className="overflow-hidden"
                         >
                           <div className="pt-4 border-t border-slate-600/50">
                             <p className="text-slate-400 text-xs leading-relaxed italic">
                               Additional certifications and compliance documentation available upon request.
                             </p>
                           </div>
                         </motion.div>
                       )}
                     </AnimatePresence>
                   )}
                 </motion.div>

                {/* Enhanced Hover Effect Overlay */}
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-br ${item.gradientFrom}/10 ${item.gradientTo}/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />

                {/* Contextual Action Indicator */}
                {currentRevealLevel !== 'initial' && (
                  <motion.div
                    className={`absolute top-4 right-4 w-8 h-8 ${item.accentColor}/20 rounded-full flex items-center justify-center backdrop-blur-sm border ${item.borderColor}/30 transition-opacity duration-300`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: 0.8,
                      scale: 1,
                      rotate: draggedCard === item.id ? [0, 180] : 0
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ 
                      rotate: { duration: 0.5, repeat: draggedCard === item.id ? Infinity : 0 }
                    }}
                  >
                    {currentRevealLevel === 'revealed' && (
                      <svg className={`w-4 h-4 ${item.textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                    {currentRevealLevel === 'expanded' && (
                      <svg className={`w-4 h-4 ${item.textColor}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </motion.div>
                )}

                {/* Reveal Level Progress Dots */}
                <div className="absolute top-4 left-4 flex space-x-1">
                  {['initial', 'revealed', 'expanded'].map((level, index) => (
                    <motion.div
                      key={level}
                      className={`w-2 h-2 rounded-full border transition-all duration-500 ${
                        currentRevealLevel === level || 
                        (currentRevealLevel === 'revealed' && level === 'initial') ||
                        (currentRevealLevel === 'expanded' && (level === 'initial' || level === 'revealed'))
                          ? `${item.accentColor} ${item.borderColor} shadow-sm` 
                          : 'bg-slate-600/50 border-slate-500/50'
                      }`}
                      animate={{
                        scale: currentRevealLevel === level ? [1, 1.3, 1] : 1
                      }}
                      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    />
                  ))}
                </div>

                {/* Enhanced Glow Effect */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${item.gradientFrom}/20 via-transparent ${item.gradientTo}/20 rounded-2xl opacity-0`}
                  animate={{
                    opacity: draggedCard === item.id ? [0, 0.5, 0] : 0,
                    x: draggedCard === item.id ? [-50, 50] : 0
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: draggedCard === item.id ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                />
              </div>

                             {/* Shadow */}
               <motion.div
                 className="absolute inset-0 bg-black/20 rounded-2xl blur-xl -z-10"
                 style={{
                   scale: draggedCard === item.id ? 1.05 : 1
                 }}
               />
            </motion.div>
          );
        })}
      </motion.div>

       {/* Simple Instruction Hint */}
       <motion.div
         initial={{ opacity: 0 }}
         animate={{ 
           opacity: isInView ? 0.8 : 0.4,
           y: 0
         }}
         transition={{ 
           delay: 1.2,
           duration: 0.5,
           ease: "easeOut"
         }}
         className="text-center mt-8"
       >
         <p className="flex items-center justify-center gap-2 text-slate-400 text-sm">
           <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
           </svg>
                       <span>{device.isMobile ? 'Drag cards to reveal details' : 'Drag cards to reveal compliance details'}</span>
           <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
           </svg>
         </p>
       </motion.div>
    </motion.div>
  );
};