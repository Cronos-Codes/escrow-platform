import React, { useState, useEffect } from 'react';

interface AIvsHumanArbitrationProps {
  userRole: string;
}

const AIvsHumanArbitration: React.FC<AIvsHumanArbitrationProps> = ({ userRole }) => {
  const [activeMode, setActiveMode] = useState<'ai' | 'human' | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [aiActive, setAiActive] = useState(false);
  const [humanActive, setHumanActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (userRole === 'guest') return;

    // Simulate AI activity
    const aiInterval = setInterval(() => {
      setAiActive(true);
      setTimeout(() => setAiActive(false), 1000);
    }, 4000);

    // Simulate human activity (less frequent)
    const humanInterval = setInterval(() => {
      setHumanActive(true);
      setTimeout(() => setHumanActive(false), 2000);
    }, 8000);

    return () => {
      clearInterval(aiInterval);
      clearInterval(humanInterval);
    };
  }, [userRole]);

  return (
    <section className="relative py-20 px-4 z-10">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
            AI vs Human Arbitration
          </span>
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Intelligent automation handles everything, with human experts stepping in only when needed
        </p>
      </div>

      {/* Arbitration Container */}
      <div className="relative max-w-6xl mx-auto">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-black/50 to-gray-900/50 rounded-2xl backdrop-blur-sm" />
        
        {/* Content */}
        <div className="relative p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* AI Side */}
            <div
              className={`relative transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <div
                className={`relative bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl p-8 border-2 transition-all duration-300 overflow-hidden ${
                  activeMode === 'ai' || aiActive
                    ? 'border-gold shadow-gold-glow scale-105'
                    : 'border-blue-500/50 shadow-blue-500/20'
                }`}
                onMouseEnter={() => setActiveMode('ai')}
                onMouseLeave={() => setActiveMode(null)}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />
                
                {/* Content */}
                <div className="relative z-10 text-center">
                  {/* AI Icon */}
                  <div className={`text-6xl mb-6 transition-transform duration-300 ${
                    activeMode === 'ai' || aiActive ? 'scale-125' : 'scale-100'
                  }`}>
                    🤖
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-4">AI Automation</h3>
                  
                  {/* Description */}
                  <p className="text-white/90 mb-6 leading-relaxed">
                    Handles 99% of escrow operations automatically:
                  </p>
                  
                  {/* Features List */}
                  <div className="space-y-3 text-left">
                    {[
                      'Fund release automation',
                      'Compliance monitoring',
                      'Transaction validation',
                      'Real-time notifications',
                      'Smart contract execution'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span className="text-white/80 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Glow */}
                <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                  activeMode === 'ai' || aiActive ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-gold/20 via-gold/40 to-gold/20 rounded-xl blur-sm" />
                </div>

                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </div>

              {/* Activity Indicator */}
              <div className="absolute -top-3 -right-3">
                <div className={`w-6 h-6 rounded-full transition-all duration-300 ${
                  aiActive ? 'bg-green-500 animate-pulse' : 'bg-blue-500'
                }`} />
              </div>
            </div>

            {/* Human Side */}
            <div
              className={`relative transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <div
                className={`relative bg-gradient-to-br from-red-600 to-orange-700 rounded-xl p-8 border-2 transition-all duration-300 overflow-hidden ${
                  activeMode === 'human' || humanActive
                    ? 'border-gold shadow-gold-glow scale-105'
                    : 'border-red-500/50 shadow-red-500/20'
                }`}
                onMouseEnter={() => setActiveMode('human')}
                onMouseLeave={() => setActiveMode(null)}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />
                
                {/* Content */}
                <div className="relative z-10 text-center">
                  {/* Human Icon */}
                  <div className={`text-6xl mb-6 transition-transform duration-300 ${
                    activeMode === 'human' || humanActive ? 'scale-125' : 'scale-100'
                  }`}>
                    👨‍⚖️
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-4">Human Expertise</h3>
                  
                  {/* Description */}
                  <p className="text-white/90 mb-6 leading-relaxed">
                    Expert intervention only when needed:
                  </p>
                  
                  {/* Features List */}
                  <div className="space-y-3 text-left">
                    {[
                      'Complex dispute resolution',
                      'Legal interpretation',
                      'Edge case handling',
                      'Policy decisions',
                      'Escalation management'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                        <span className="text-white/80 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Glow */}
                <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                  activeMode === 'human' || humanActive ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-gold/20 via-gold/40 to-gold/20 rounded-xl blur-sm" />
                </div>

                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </div>

              {/* Activity Indicator */}
              <div className="absolute -top-3 -right-3">
                <div className={`w-6 h-6 rounded-full transition-all duration-300 ${
                  humanActive ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                }`} />
              </div>
            </div>
          </div>

          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-0.5 bg-gradient-to-r from-blue-500 via-gold to-red-500">
            <div className="w-full h-full bg-gold/50 animate-pulse" />
          </div>

          {/* Center Node */}
          <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gold rounded-full shadow-gold-glow">
            <div className="w-full h-full bg-gold animate-pulse rounded-full" />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-12 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-gold mb-2">99%</div>
            <div className="text-gray-300">AI Handled</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gold mb-2">&lt;1%</div>
            <div className="text-gray-300">Human Intervention</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gold mb-2">24/7</div>
            <div className="text-gray-300">Availability</div>
          </div>
        </div>
      </div>

      {/* Luxury Accent Elements */}
      <div className="absolute top-10 left-10 w-16 h-16 border border-gold/20 rounded-full opacity-30" />
      <div className="absolute bottom-10 right-10 w-12 h-12 border border-gold/20 rounded-full opacity-30" />
    </section>
  );
};

export default AIvsHumanArbitration;
