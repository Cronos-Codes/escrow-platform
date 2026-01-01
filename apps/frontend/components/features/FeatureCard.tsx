import React, { useState, useEffect } from 'react';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  visibleFor: string[];
  premium?: boolean;
}

interface FeatureCardProps {
  feature: Feature;
  index: number;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  userRole: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  feature, 
  index, 
  isHovered, 
  onHover, 
  userRole 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Staggered animation on load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  const handleMouseEnter = () => {
    onHover(feature.id);
    setIsFlipped(true);
  };

  const handleMouseLeave = () => {
    onHover(null);
    setIsFlipped(false);
  };

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  // Calculate card position for fanned effect
  const getCardTransform = () => {
    if (isHovered) {
      return 'translateY(-20px) scale(1.05) rotateY(0deg)';
    }
    
    const baseRotation = (index % 3 - 1) * 2; // Slight rotation for fanned effect
    const baseTranslateY = index % 2 === 0 ? 0 : 10; // Slight vertical offset
    
    return `translateY(${baseTranslateY}px) rotateY(${baseRotation}deg)`;
  };

  return (
    <div
      className={`relative group perspective-1000 transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{
        transform: getCardTransform(),
        zIndex: isHovered ? 10 : 1,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Card Container */}
      <div
        className={`relative w-full h-80 cursor-pointer transition-all duration-500 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Card Front (Casino Deck Back) */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <div className="relative w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl border-2 border-gold/30 shadow-gold-soft overflow-hidden group-hover:shadow-gold-glow transition-all duration-300">
            {/* Gold Emboss Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-gold/10" />
            <div className="absolute top-4 left-4 w-16 h-20 border border-gold/20 rounded-lg" />
            <div className="absolute top-4 right-4 w-16 h-20 border border-gold/20 rounded-lg" />
            <div className="absolute bottom-4 left-4 w-16 h-20 border border-gold/20 rounded-lg" />
            <div className="absolute bottom-4 right-4 w-16 h-20 border border-gold/20 rounded-lg" />
            
            {/* Center Pattern */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-32 border-2 border-gold/40 rounded-lg flex items-center justify-center">
                <div className="text-gold text-2xl font-bold">♠</div>
              </div>
            </div>

            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            
            {/* Premium Badge */}
            {feature.premium && (
              <div className="absolute top-3 right-3">
                <div className="px-2 py-1 bg-gradient-to-r from-gold to-gold-dark text-black text-xs font-bold rounded-full shadow-gold-soft">
                  PREMIUM
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card Back (Feature Details) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          <div className={`relative w-full h-full bg-gradient-to-br ${feature.color} rounded-xl border-2 border-gold/50 shadow-gold-glow overflow-hidden`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />
            
            {/* Content */}
            <div className="relative z-10 p-6 h-full flex flex-col justify-between">
              {/* Header */}
              <div className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              </div>

              {/* Description */}
              <div className="flex-1 flex items-center">
                <p className="text-white/90 text-sm leading-relaxed text-center">
                  {feature.description}
                </p>
              </div>

              {/* Footer */}
              <div className="text-center">
                <div className="w-8 h-1 bg-white/50 rounded-full mx-auto mb-2" />
                <div className="text-white/70 text-xs">Gold Escrow</div>
              </div>
            </div>

            {/* Glimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </div>
        </div>
      </div>

      {/* Flip Edge Glow */}
      <div className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300 ${
        isFlipped ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-r from-gold/20 via-gold/40 to-gold/20 rounded-xl blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/30 to-transparent rounded-xl" />
      </div>

      {/* Hover Shimmer */}
      <div className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </div>

      {/* Guest Blur Effect */}
      {userRole === 'guest' && feature.premium && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="text-gold text-2xl mb-2">🔒</div>
            <div className="text-gold text-sm font-medium">Premium Feature</div>
            <div className="text-gold/70 text-xs">Sign up to unlock</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureCard;
