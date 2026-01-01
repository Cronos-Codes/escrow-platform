import React, { useState, useEffect } from 'react';

interface AIFlowStripProps {
  userRole: string;
}

interface FlowStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const flowSteps: FlowStep[] = [
  {
    id: 'create',
    title: 'Create',
    description: 'Initialize escrow with smart contract deployment',
    icon: '✨',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'lock',
    title: 'Lock',
    description: 'Funds securely locked in blockchain escrow',
    icon: '🔒',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'track',
    title: 'Track',
    description: 'Real-time monitoring and compliance checks',
    icon: '📊',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    id: 'release',
    title: 'Release',
    description: 'Automated fund release upon conditions met',
    icon: '🚀',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'dispute',
    title: 'Dispute',
    description: 'Human arbitration when AI cannot resolve',
    icon: '⚖️',
    color: 'from-gray-600 to-gray-800',
  },
];

const AIFlowStrip: React.FC<AIFlowStripProps> = ({ userRole }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (userRole === 'guest') return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % flowSteps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [userRole]);

  return (
    <section className="relative py-20 px-4 z-10">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
            AI-Controlled Flow
          </span>
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Experience the complete escrow lifecycle powered by intelligent automation
        </p>
      </div>

      {/* Flow Strip Container */}
      <div className="relative max-w-6xl mx-auto">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 via-black/50 to-gray-900/50 rounded-2xl backdrop-blur-sm" />
        
        {/* Flow Steps */}
        <div className="relative p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {flowSteps.map((step, index) => (
              <div
                key={step.id}
                className={`relative flex-1 transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                {/* Step Card */}
                <div
                  className={`relative group cursor-pointer transition-all duration-300 ${
                    activeStep === index ? 'scale-110' : 'scale-100'
                  }`}
                  onMouseEnter={() => setActiveStep(index)}
                >
                  {/* Card Background */}
                  <div className={`relative bg-gradient-to-br ${step.color} rounded-xl p-6 border-2 border-gold/30 shadow-gold-soft overflow-hidden group-hover:shadow-gold-glow transition-all duration-300`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />
                    
                    {/* Content */}
                    <div className="relative z-10 text-center">
                      {/* Icon */}
                      <div className={`text-4xl mb-4 transition-transform duration-300 ${
                        activeStep === index ? 'scale-125' : 'scale-100'
                      }`}>
                        {step.icon}
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                      
                      {/* Description */}
                      <p className="text-white/80 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Active Glow */}
                    <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                      activeStep === index ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <div className="absolute inset-0 bg-gradient-to-r from-gold/20 via-gold/40 to-gold/20 rounded-xl blur-sm" />
                    </div>

                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </div>

                  {/* Step Number */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-gold text-black font-bold rounded-full flex items-center justify-center text-sm shadow-gold-soft">
                    {index + 1}
                  </div>
                </div>

                {/* Connection Line */}
                {index < flowSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-gold to-transparent transform -translate-y-1/2">
                    <div className="w-full h-full bg-gold/50 animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Connection Lines */}
          <div className="md:hidden flex justify-center mt-8">
            <div className="flex flex-col gap-4">
              {flowSteps.slice(0, -1).map((_, index) => (
                <div key={index} className="w-0.5 h-8 bg-gradient-to-b from-gold to-transparent mx-auto">
                  <div className="w-full h-full bg-gold/50 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Luxury Accent Elements */}
      <div className="absolute top-10 left-10 w-16 h-16 border border-gold/20 rounded-full opacity-30" />
      <div className="absolute bottom-10 right-10 w-12 h-12 border border-gold/20 rounded-full opacity-30" />
    </section>
  );
};

export default AIFlowStrip;
