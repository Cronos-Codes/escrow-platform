import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useRef } from 'react';
import { CardCarousel } from '../ui/CardCarousel';

interface GlobalOfficesMapSectionProps {
  userRole: string;
}

interface Office {
  id: string;
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
  image: string;
}

const offices: Office[] = [
  {
    id: 'dubai',
    name: 'Dubai International Financial Centre',
    city: 'Dubai',
    country: 'UAE',
    timezone: 'GST (UTC+4)',
    phone: '+971 4 123 4567',
    localTime: '14:30',
    isOpen: true,
    color: 'from-purple-400 to-purple-600',
    icon: '🏛️',
    description: 'Middle East Financial Hub',
    image: 'https://img.freepik.com/free-photo/dubai-skyline-with-burj-khalifa_1127-3320.jpg?w=400&h=300&fit=crop'
  },
  {
    id: 'nairobi',
    name: 'Nairobi Securities Exchange',
    city: 'Nairobi',
    country: 'Kenya',
    timezone: 'EAT (UTC+3)',
    phone: '+254 20 123 4567',
    localTime: '13:30',
    isOpen: true,
    color: 'from-teal-400 to-teal-600',
    icon: '🌆',
    description: 'East Africa Trading Center',
    image: 'https://img.freepik.com/free-photo/nairobi-cityscape-kenya_1127-3321.jpg?w=400&h=300&fit=crop'
  },
  {
    id: 'zurich',
    name: 'Bahnhofstrasse Financial District',
    city: 'Zurich',
    country: 'Switzerland',
    timezone: 'CET (UTC+1)',
    phone: '+41 44 123 4567',
    localTime: '11:30',
    isOpen: true,
    color: 'from-blue-400 to-blue-600',
    icon: '🏦',
    description: 'European Banking Capital',
    image: 'https://img.freepik.com/free-photo/zurich-switzerland-cityscape_1127-3322.jpg?w=400&h=300&fit=crop'
  }
];

export const GlobalOfficesMapSection: React.FC<GlobalOfficesMapSectionProps> = ({
  userRole
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [showFlipCard, setShowFlipCard] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Convert offices to carousel images format with escrow data
  const carouselImages = offices.map(office => ({
    src: office.image,
    alt: `${office.city} - ${office.name}`,
    title: office.city,
    subtitle: office.name,
    description: `${office.description}. Available 24/7 for secure escrow services.`,
    status: 'active' as const,
    amount: '2.5M',
    currency: 'USD',
    officeDetails: office
  }));

  // Handle card click to show flip card
  const handleCardClick = (index: number, officeDetails?: any) => {
    if (officeDetails) {
      setSelectedOffice(officeDetails);
      setShowFlipCard(true);
    }
  };

  // Close flip card
  const closeFlipCard = () => {
    setShowFlipCard(false);
    setSelectedOffice(null);
  };

  return (
    <section 
      ref={sectionRef}
      className="py-20 px-4 sm:px-6 bg-black"
      role="region"
      aria-label="Global Offices"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Global Presence
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Our offices span the world's major financial centers, providing 24/7 support across all time zones.
          </p>
        </motion.div>

        {/* Enhanced Card Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <CardCarousel 
            images={carouselImages}
            autoplayDelay={4000}
            showPagination={true}
            showNavigation={true}
            showStatus={true}
            showAmount={true}
            theme="escrow"
            onCardClick={handleCardClick}
          />
        </motion.div>

        {/* Flip Card Modal for Office Details */}
        <AnimatePresence>
          {showFlipCard && selectedOffice && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={closeFlipCard}
            >
              <motion.div
                initial={{ scale: 0.8, rotateY: -90 }}
                animate={{ scale: 1, rotateY: 0 }}
                exit={{ scale: 0.8, rotateY: 90 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className={`relative w-full max-w-md bg-gradient-to-br ${selectedOffice.color} rounded-3xl p-8 shadow-2xl border border-white/20`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={closeFlipCard}
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                  aria-label="Close office details"
                >
                  ✕
                </button>

                {/* Office Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
                    {selectedOffice.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-2xl mb-1">{selectedOffice.name}</h3>
                    <p className="text-white/80 text-lg">{selectedOffice.city}, {selectedOffice.country}</p>
                  </div>
                </div>

                {/* Office Description */}
                <p className="text-white/90 text-base leading-relaxed mb-6 italic">
                  {selectedOffice.description}
                </p>

                {/* Office Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between bg-white/10 rounded-xl p-4">
                    <span className="text-white/80 text-sm font-medium">Status</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${selectedOffice.isOpen ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                      <span className="text-white font-semibold">
                        {selectedOffice.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-white/10 rounded-xl p-4">
                    <span className="text-white/80 text-sm font-medium">Local Time</span>
                    <span className="text-white font-semibold">{selectedOffice.localTime}</span>
                  </div>

                  <div className="flex items-center justify-between bg-white/10 rounded-xl p-4">
                    <span className="text-white/80 text-sm font-medium">Timezone</span>
                    <span className="text-white font-semibold">{selectedOffice.timezone}</span>
                  </div>

                  <div className="flex items-center justify-between bg-white/10 rounded-xl p-4">
                    <span className="text-white/80 text-sm font-medium">Phone</span>
                    <span className="text-white font-semibold">{selectedOffice.phone}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-white/20 backdrop-blur-sm text-white font-semibold py-3 px-4 rounded-xl hover:bg-white/30 transition-colors"
                    onClick={() => window.location.href = `tel:${selectedOffice.phone.replace(/\s/g, '')}`}
                  >
                    📞 Call Now
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-yellow-400/20 backdrop-blur-sm text-yellow-300 font-semibold py-3 px-4 rounded-xl hover:bg-yellow-400/30 transition-colors border border-yellow-400/30"
                    onClick={() => {
                      closeFlipCard();
                      // Trigger AI chat for office-specific inquiries
                      const event = new CustomEvent('openAIChat');
                      window.dispatchEvent(event);
                    }}
                  >
                    💬 Chat Support
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

