import React, { useState, useEffect } from 'react';
import FeatureCard from './FeatureCard';

interface FeaturesDeckSectionProps {
  userRole: string;
  isLoaded: boolean;
}

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  visibleFor: string[];
  premium?: boolean;
}

const features: Feature[] = [
  {
    id: 'ai-escrow',
    title: 'AI-Controlled Escrow',
    description: 'Intelligent automation handles fund releases, compliance checks, and transaction monitoring with precision.',
    icon: '🤖',
    color: 'from-blue-500 to-purple-600',
    visibleFor: ['guest', 'user', 'broker', 'admin'],
  },
  {
    id: 'blockchain-security',
    title: 'Blockchain Security',
    description: 'Immutable ledger technology ensures transparency, traceability, and tamper-proof transaction records.',
    icon: '🔗',
    color: 'from-green-500 to-emerald-600',
    visibleFor: ['guest', 'user', 'broker', 'admin'],
  },
  {
    id: 'global-transactions',
    title: 'Global Transactions',
    description: 'Cross-border escrow services supporting multiple currencies and jurisdictions worldwide.',
    icon: '🌍',
    color: 'from-cyan-500 to-blue-600',
    visibleFor: ['guest', 'user', 'broker', 'admin'],
  },
  {
    id: 'paymaster-support',
    title: 'Paymaster Support',
    description: 'Gas fee sponsorship and transaction optimization for seamless blockchain interactions.',
    icon: '⛽',
    color: 'from-orange-500 to-red-600',
    visibleFor: ['guest', 'user', 'broker', 'admin'],
  },
  {
    id: 'human-arbitration',
    title: 'Human Arbitration',
    description: 'Expert dispute resolution with legal professionals when AI cannot resolve conflicts.',
    icon: '⚖️',
    color: 'from-purple-500 to-indigo-600',
    visibleFor: ['guest', 'user', 'broker', 'admin'],
  },
  {
    id: 'role-dashboards',
    title: 'Role-Based Dashboards',
    description: 'Customized interfaces for buyers, sellers, brokers, and administrators with role-specific tools.',
    icon: '📊',
    color: 'from-indigo-500 to-purple-600',
    visibleFor: ['user', 'broker', 'admin'],
    premium: true,
  },
  {
    id: 'real-time-notifications',
    title: 'Real-Time Notifications',
    description: 'Instant alerts for transaction updates, fund releases, and important milestones.',
    icon: '🔔',
    color: 'from-pink-500 to-rose-600',
    visibleFor: ['user', 'broker', 'admin'],
    premium: true,
  },
  {
    id: 'admin-tools',
    title: 'Admin Tools',
    description: 'Advanced management capabilities for escrow oversight, dispute resolution, and system administration.',
    icon: '🛠️',
    color: 'from-gray-600 to-gray-800',
    visibleFor: ['admin'],
    premium: true,
  },
  {
    id: 'dashboard-management',
    title: 'Dashboard Management',
    description: 'Comprehensive analytics, reporting, and control panel for broker and admin operations.',
    icon: '🎛️',
    color: 'from-yellow-500 to-amber-600',
    visibleFor: ['broker', 'admin'],
    premium: true,
  },
];

const FeaturesDeckSection: React.FC<FeaturesDeckSectionProps> = ({ userRole, isLoaded }) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [shuffledFeatures, setShuffledFeatures] = useState<Feature[]>([]);

  // Filter features based on user role
  const filteredFeatures = features.filter(feature => 
    feature.visibleFor.includes(userRole)
  );

  // Shuffle features on load and when user role changes
  useEffect(() => {
    const shuffleArray = (array: Feature[]) => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };

    setShuffledFeatures(shuffleArray(filteredFeatures));
  }, [filteredFeatures]);

  if (!isLoaded) return null;

  return (
    <section className="relative py-20 px-4 z-10">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
            Feature Deck
          </span>
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Explore our comprehensive suite of escrow features. 
          {userRole === 'guest' && ' Some premium features are previewed below.'}
        </p>
      </div>

      {/* Deck Container */}
      <div className="relative max-w-7xl mx-auto">
        {/* Velvet Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl opacity-80" />
        <div className="absolute inset-0 bg-[url('/patterns/hexagon.svg')] opacity-5 rounded-3xl" />
        
        {/* Cards Container */}
        <div className="relative p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {shuffledFeatures.map((feature, index) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                index={index}
                isHovered={hoveredCard === feature.id}
                onHover={setHoveredCard}
                userRole={userRole}
              />
            ))}
          </div>
        </div>

        {/* Deck Shuffle Effect Layer */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-gold/5 to-transparent opacity-0 transition-opacity duration-500" />
        </div>
      </div>

      {/* Luxury Accent Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 border border-gold/20 rounded-full opacity-30" />
      <div className="absolute bottom-10 right-10 w-16 h-16 border border-gold/20 rounded-full opacity-30" />
      <div className="absolute top-1/2 left-5 w-1 h-32 bg-gradient-to-b from-transparent via-gold/30 to-transparent" />
      <div className="absolute top-1/2 right-5 w-1 h-32 bg-gradient-to-b from-transparent via-gold/30 to-transparent" />
    </section>
  );
};

export default FeaturesDeckSection;
