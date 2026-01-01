import React, { useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';

interface StoryTimelineSectionProps {
  userRole: string;
}

interface TimelineStep {
  id: string;
  year: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  details: string[];
  isVisible: boolean;
}

const timelineSteps: TimelineStep[] = [
  {
    id: 'concept',
    year: '2020',
    title: 'The Vision',
    description: 'Gold Escrow was conceived as a revolutionary approach to digital trust.',
    icon: '💡',
    color: 'from-blue-400 to-blue-600',
    details: [
      'Identified market need for AI-driven escrow services',
      'Assembled founding team with fintech expertise',
      'Developed initial blockchain architecture concept'
    ],
    isVisible: true
  },
  {
    id: 'development',
    year: '2021',
    title: 'Core Development',
    description: 'Built the foundational AI and blockchain infrastructure.',
    icon: '⚙️',
    color: 'from-purple-400 to-purple-600',
    details: [
      'Developed proprietary AI decision-making engine',
      'Implemented blockchain-based escrow smart contracts',
      'Created automated dispute resolution system'
    ],
    isVisible: true
  },
  {
    id: 'launch',
    year: '2022',
    title: 'Global Launch',
    description: 'Launched the platform with regulatory compliance across multiple jurisdictions.',
    icon: '🚀',
    color: 'from-green-400 to-green-600',
    details: [
      'Secured regulatory approvals in UAE, UK, and Singapore',
      'Launched beta with 100+ enterprise clients',
      'Processed first $1B in transaction volume'
    ],
    isVisible: true
  },
  {
    id: 'expansion',
    year: '2023',
    title: 'Rapid Expansion',
    description: 'Expanded to 50+ countries with advanced AI capabilities.',
    icon: '🌍',
    color: 'from-orange-400 to-orange-600',
    details: [
      'Expanded to 50+ countries with local compliance',
      'Enhanced AI with 99.9% accuracy rate',
      'Reached $5B in total transaction volume'
    ],
    isVisible: true
  },
  {
    id: 'innovation',
    year: '2024',
    title: 'AI Revolution',
    description: 'Pioneered next-generation AI-driven financial services.',
    icon: '🤖',
    color: 'from-indigo-400 to-indigo-600',
    details: [
      'Launched advanced AI dispute resolution',
      'Introduced predictive risk assessment',
      'Achieved 99.99% system uptime'
    ],
    isVisible: true
  },
  {
    id: 'future',
    year: '2025+',
    title: 'The Future',
    description: 'Continuing to redefine trust in the digital economy.',
    icon: '🔮',
    color: 'from-pink-400 to-pink-600',
    details: [
      'Expanding into new financial services',
      'Developing quantum-resistant security',
      'Building global trust infrastructure'
    ],
    isVisible: true
  }
];

export const StoryTimelineSection: React.FC<StoryTimelineSectionProps> = ({ userRole }) => {
  const [selectedStep, setSelectedStep] = useState<TimelineStep | null>(null);
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const getVisibleSteps = () => {
    if (userRole === 'guest') {
      return timelineSteps.filter(step => step.isVisible).slice(0, 4);
    }
    return timelineSteps.filter(step => step.isVisible);
  };

  const handleStepClick = (step: TimelineStep) => {
    setSelectedStep(selectedStep?.id === step.id ? null : step);
  };

  return (
    <section id="story-timeline" ref={containerRef} className="py-20 px-4 relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              From Concept to Global Impact
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Our journey from a bold vision to a revolutionary platform that's transforming how the world thinks about trust.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500/30 via-purple-500/30 to-indigo-500/30 rounded-full" />

          {/* Timeline Steps */}
          <div className="space-y-16">
            {getVisibleSteps().map((step, index) => {
              const stepRef = useRef<HTMLDivElement>(null);
              const stepInView = useInView(stepRef, { once: true, margin: "-50px" });
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={step.id}
                  ref={stepRef}
                  className={`relative flex items-center ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
                  initial={{ opacity: 0, x: isEven ? -100 : 100 }}
                  animate={stepInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                >
                  {/* Timeline Node */}
                  <div className="relative z-20 flex-shrink-0">
                    <motion.div
                      className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center text-2xl shadow-2xl border-4 border-white/20 backdrop-blur-sm`}
                      whileHover={{ scale: 1.2, boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)" }}
                      onHoverStart={() => setHoveredStep(step.id)}
                      onHoverEnd={() => setHoveredStep(null)}
                      onClick={() => handleStepClick(step)}
                      style={{ cursor: 'pointer' }}
                    >
                      {step.icon}
                    </motion.div>

                    {/* Pulse Effect */}
                    <AnimatePresence>
                      {hoveredStep === step.id && (
                        <motion.div
                          className={`absolute inset-0 w-16 h-16 bg-gradient-to-br ${step.color} rounded-full`}
                          initial={{ scale: 1, opacity: 0.6 }}
                          animate={{ scale: 2, opacity: 0 }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Content Card */}
                  <div className={`flex-1 ${isEven ? 'ml-8' : 'mr-8'}`}>
                    <motion.div
                      className={`bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl hover:shadow-3xl transition-all duration-300`}
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
                        borderColor: "rgba(59, 130, 246, 0.3)"
                      }}
                      onHoverStart={() => setHoveredStep(step.id)}
                      onHoverEnd={() => setHoveredStep(null)}
                      onClick={() => handleStepClick(step)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="flex items-center mb-4">
                        <span className={`text-4xl font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                          {step.year}
                        </span>
                        <div className={`ml-4 w-8 h-0.5 bg-gradient-to-r ${step.color} rounded-full`} />
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                      <p className="text-slate-300 text-lg leading-relaxed mb-4">{step.description}</p>

                      {/* Hover Glow Effect */}
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-2xl opacity-0`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: hoveredStep === step.id ? 0.1 : 0 }}
                        transition={{ duration: 0.3 }}
                      />

                      {/* Particle Effect */}
                      <AnimatePresence>
                        {hoveredStep === step.id && (
                          <>
                            {[...Array(6)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-blue-400 rounded-full"
                                initial={{
                                  opacity: 0,
                                  scale: 0,
                                  x: 0,
                                  y: 0
                                }}
                                animate={{
                                  opacity: [0, 1, 0],
                                  scale: [0, 1, 0],
                                  x: Math.cos((i * 60) * Math.PI / 180) * 60,
                                  y: Math.sin((i * 60) * Math.PI / 180) * 60,
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  delay: i * 0.1,
                                }}
                              />
                            ))}
                          </>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Role-based Additional Content */}
        {userRole !== 'guest' && (
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-8 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
              <h3 className="text-3xl font-bold text-blue-400 mb-4">
                {userRole === 'admin' ? 'Full Timeline Access' : 'Extended History'}
              </h3>
              <p className="text-slate-300 text-lg">
                {userRole === 'admin'
                  ? 'Access complete development history, technical milestones, and future roadmap.'
                  : 'Explore detailed milestones and technical achievements that shaped our platform.'
                }
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedStep && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStep(null)}
          >
            <motion.div
              className={`bg-gradient-to-br ${selectedStep.color} p-8 rounded-2xl max-w-2xl w-full shadow-2xl border border-white/20`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mr-6 backdrop-blur-sm">
                  <span className="text-4xl">{selectedStep.icon}</span>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white">{selectedStep.title}</h3>
                  <p className="text-white/80 text-xl">{selectedStep.year}</p>
                </div>
              </div>

              <p className="text-white/90 text-lg leading-relaxed mb-6">{selectedStep.description}</p>

              <div className="mb-6">
                <h4 className="text-white font-bold text-lg mb-3">Key Achievements:</h4>
                <ul className="space-y-2">
                  {selectedStep.details.map((detail, index) => (
                    <li key={index} className="flex items-center text-white/80">
                      <div className="w-2 h-2 bg-white/60 rounded-full mr-3" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-colors backdrop-blur-sm"
                onClick={() => setSelectedStep(null)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};


