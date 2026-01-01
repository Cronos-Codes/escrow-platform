import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface CardCarouselProps {
  images: Array<{
    src: string;
    alt: string;
    title?: string;
    subtitle?: string;
    description?: string;
    status?: 'active' | 'pending' | 'completed';
    amount?: string;
    currency?: string;
    officeDetails?: {
      name: string;
      city: string;
      country: string;
      timezone: string;
      phone: string;
      localTime: string;
      isOpen: boolean;
      color: string;
      icon: string;
      description: string;
    };
  }>;
  autoplayDelay?: number;
  showPagination?: boolean;
  showNavigation?: boolean;
  showStatus?: boolean;
  showAmount?: boolean;
  theme?: 'escrow' | 'default';
  onCardClick?: (index: number, officeDetails?: any) => void;
}

export const CardCarousel: React.FC<CardCarouselProps> = ({
  images,
  autoplayDelay = 4000,
  showPagination = true,
  showNavigation = true,
  showStatus = true,
  showAmount = true,
  theme = 'escrow',
  onCardClick
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Enhanced auto-rotate carousel with pause on hover
  useEffect(() => {
    if (!isAutoPlaying || isPaused) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, autoplayDelay);

    return () => clearInterval(interval);
  }, [images.length, autoplayDelay, isAutoPlaying, isPaused]);

  const handleCardClick = useCallback((index: number) => {
    setActiveIndex(index);
    setIsAutoPlaying(false);
    // Resume autoplay after 8 seconds of inactivity for escrow platform
    setTimeout(() => setIsAutoPlaying(true), 8000);
    
    // Call the onCardClick callback if provided
    if (onCardClick) {
      onCardClick(index, images[index]?.officeDetails);
    }
  }, [onCardClick, images]);

  const nextCard = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % images.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  }, [images.length]);

  const prevCard = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  }, [images.length]);

  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'pending': return 'Pending';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  return (
    <div 
      className="relative w-full max-w-6xl mx-auto"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Carousel Container */}
      <div className="relative h-[450px] sm:h-[550px] flex items-center justify-center">
        {/* Cards */}
        {images.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8, x: 100 }}
            animate={{ 
              opacity: 1, 
              scale: index === activeIndex ? 1 : 0.85,
              x: index === activeIndex ? 0 : (index < activeIndex ? -140 : 140),
              rotateY: index === activeIndex ? 0 : (index < activeIndex ? -20 : 20),
              zIndex: index === activeIndex ? 10 : index < activeIndex ? 5 : 5
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className={`absolute cursor-pointer transform perspective-1000 ${
              index === activeIndex ? 'z-10' : 'z-5'
            }`}
            onClick={() => handleCardClick(index)}
          >
            {/* Card - Enhanced for Escrow Platform */}
            <div className={`relative w-72 h-96 sm:w-80 sm:h-[480px] rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-500 ${
              index === activeIndex 
                ? 'ring-2 ring-yellow-400/50 shadow-2xl scale-105' 
                : 'shadow-lg scale-95'
            }`}>
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 288px, 320px"
                  priority={index === activeIndex}
                />
              </div>
              
              {/* Enhanced Gradient Overlay for Escrow */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-transparent" />
              
              {/* Escrow Platform Branding */}
              <div className="absolute top-4 left-4 opacity-80">
                <div className="bg-yellow-400/20 backdrop-blur-sm rounded-lg px-3 py-1">
                  <span className="text-yellow-400 text-xs font-bold tracking-wider">GOLD ESCROW</span>
                </div>
              </div>

              {/* Status Badge */}
              {showStatus && image.status && (
                <div className="absolute top-4 right-4">
                  <div className={`${getStatusColor(image.status)} rounded-full px-3 py-1 text-white text-xs font-semibold shadow-lg`}>
                    {getStatusText(image.status)}
                  </div>
                </div>
              )}
              
              {/* Content */}
              <div className="relative z-10 flex flex-col justify-end h-full p-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="space-y-4"
                >
                  {/* Title and Subtitle */}
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
                      {image.title || image.alt}
                    </h3>
                    {image.subtitle && (
                      <p className="text-white/80 text-sm font-medium mb-2">
                        {image.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  {image.description && (
                    <p className="text-white/90 text-sm leading-relaxed">
                      {image.description}
                    </p>
                  )}

                  {/* Amount Display for Escrow */}
                  {showAmount && image.amount && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">Escrow Amount</span>
                        <span className="text-yellow-400 text-lg font-bold">
                          {image.amount} {image.currency || 'USD'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-yellow-400 text-black px-4 py-3 rounded-xl text-sm font-bold hover:bg-yellow-300 transition-colors shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Escrow action
                      }}
                    >
                      View Details
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white/20 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/30 transition-colors backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Secondary action
                      }}
                    >
                      Contact
                    </motion.button>
                  </div>
                </motion.div>
              </div>

              {/* Escrow Security Badge */}
              <div className="absolute bottom-4 right-4">
                <div className="bg-green-500/20 backdrop-blur-sm rounded-full p-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Enhanced Navigation Arrows */}
        {showNavigation && (
          <>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevCard}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors z-20 border border-white/20"
              aria-label="Previous card"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextCard}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors z-20 border border-white/20"
              aria-label="Next card"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </>
        )}

        {/* Autoplay Indicator */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
            <div className={`w-2 h-2 rounded-full ${isAutoPlaying && !isPaused ? 'bg-yellow-400' : 'bg-white/40'}`} />
            <span className="text-white/80 text-xs font-medium">
              {isAutoPlaying && !isPaused ? 'Auto-playing' : 'Paused'}
            </span>
          </div>
        </div>
      </div>



      {/* Enhanced Pagination Dots - Moved to Bottom */}
      {showPagination && (
        <div className="flex justify-center mt-6 gap-4">
          {images.map((_, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => handleCardClick(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? 'bg-yellow-400 scale-125 shadow-lg' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
