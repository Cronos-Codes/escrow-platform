import React, { useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';

interface TeamHologramSectionProps {
  userRole: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  expertise: string[];
  isVisible: boolean;
  color: string;
}

const teamMembers: TeamMember[] = [
  {
    id: 'ceo',
    name: 'Sarah Chen',
    role: 'Chief Executive Officer',
    avatar: '👩‍💼',
    bio: 'Former Goldman Sachs executive with 15+ years in fintech. Led the vision for AI-driven escrow services and global expansion.',
    expertise: ['Fintech Strategy', 'AI Integration', 'Global Operations'],
    isVisible: true,
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 'cto',
    name: 'Dr. Marcus Rodriguez',
    role: 'Chief Technology Officer',
    avatar: '👨‍💻',
    bio: 'PhD in Computer Science from MIT. Expert in blockchain architecture and AI systems. Previously led engineering at Coinbase.',
    expertise: ['Blockchain', 'AI/ML', 'System Architecture'],
    isVisible: true,
    color: 'from-purple-400 to-purple-600'
  },
  {
    id: 'cfo',
    name: 'Amira Al-Zahra',
    role: 'Chief Financial Officer',
    avatar: '👩‍💼',
    bio: 'Former CFO at Dubai Financial Services Authority. Expert in regulatory compliance and international financial operations.',
    expertise: ['Regulatory Compliance', 'Financial Operations', 'Risk Management'],
    isVisible: true,
    color: 'from-green-400 to-green-600'
  },
  {
    id: 'head-ai',
    name: 'Dr. James Kim',
    role: 'Head of AI Research',
    avatar: '🤖',
    bio: 'Leading AI researcher with focus on automated decision-making systems. PhD from Stanford, published 50+ papers on AI ethics.',
    expertise: ['AI Ethics', 'Machine Learning', 'Decision Systems'],
    isVisible: true,
    color: 'from-indigo-400 to-indigo-600'
  },
  {
    id: 'head-security',
    name: 'Elena Petrov',
    role: 'Head of Security',
    avatar: '🛡️',
    bio: 'Former NSA cybersecurity expert. Specializes in blockchain security and enterprise-grade protection systems.',
    expertise: ['Cybersecurity', 'Blockchain Security', 'Enterprise Security'],
    isVisible: true,
    color: 'from-red-400 to-red-600'
  },
  {
    id: 'ai-engine',
    name: 'Gold Escrow AI',
    role: 'Automated Escrow Engine',
    avatar: '⚡',
    bio: 'Our proprietary AI system that handles 95% of escrow operations automatically. Processes thousands of transactions daily with 99.9% accuracy.',
    expertise: ['Transaction Processing', 'Dispute Resolution', 'Risk Assessment'],
    isVisible: true,
    color: 'from-cyan-400 to-cyan-600'
  }
];

export const TeamHologramSection: React.FC<TeamHologramSectionProps> = ({ userRole }) => {
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const getVisibleMembers = () => {
    if (userRole === 'guest') {
      return teamMembers.filter(member => 
        member.isVisible && member.id !== 'head-ai' && member.id !== 'head-security'
      );
    }
    return teamMembers.filter(member => member.isVisible);
  };

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(selectedMember?.id === member.id ? null : member);
  };

  return (
    <section ref={containerRef} className="py-20 px-4 relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-500/3 to-purple-500/3 rounded-full blur-3xl" />
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
              The Architects of Trust
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Meet the brilliant minds and advanced AI systems that power Gold Escrow's revolutionary platform.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {getVisibleMembers().map((member, index) => {
            const memberRef = useRef<HTMLDivElement>(null);
            const memberInView = useInView(memberRef, { once: true, margin: "-50px" });

            return (
              <motion.div
                key={member.id}
                ref={memberRef}
                className="relative group"
                initial={{ opacity: 0, y: 100, scale: 0.8 }}
                animate={memberInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, z: 50 }}
                onHoverStart={() => setHoveredMember(member.id)}
                onHoverEnd={() => setHoveredMember(null)}
              >
                <motion.div
                  className={`relative bg-gradient-to-br ${member.color} p-8 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl cursor-pointer overflow-hidden`}
                  onClick={() => handleMemberClick(member)}
                  animate={{
                    boxShadow: hoveredMember === member.id
                      ? "0 25px 50px rgba(0,0,0,0.3)"
                      : "0 10px 30px rgba(0,0,0,0.2)"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Holographic Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />

                  {/* Avatar */}
                  <div className="relative z-10 text-center mb-6">
                    <motion.div
                      className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30 backdrop-blur-sm"
                      animate={{
                        scale: hoveredMember === member.id ? 1.1 : 1,
                        boxShadow: hoveredMember === member.id
                          ? "0 0 30px rgba(59, 130, 246, 0.5)"
                          : "0 0 10px rgba(255, 255, 255, 0.2)"
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="text-4xl">{member.avatar}</span>
                    </motion.div>

                    <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                    <p className="text-white/80 text-lg">{member.role}</p>
                  </div>

                  {/* Expertise Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {member.expertise.slice(0, 2).map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-3 py-1 bg-white/20 text-white text-sm rounded-full border border-white/30 backdrop-blur-sm"
                      >
                        {skill}
                      </span>
                    ))}
                    {member.expertise.length > 2 && (
                      <span className="px-3 py-1 bg-white/20 text-white text-sm rounded-full border border-white/30 backdrop-blur-sm">
                        +{member.expertise.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Hover Glow Effect */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${member.color} rounded-2xl`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredMember === member.id ? 0.1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Particle Effect */}
                  <AnimatePresence>
                    {hoveredMember === member.id && (
                      <>
                        {[...Array(8)].map((_, i) => (
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
                              x: Math.cos((i * 45) * Math.PI / 180) * 80,
                              y: Math.sin((i * 45) * Math.PI / 180) * 80,
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

                {/* Glow Effect */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${member.color} rounded-2xl blur-xl opacity-0`}
                  animate={{ opacity: hoveredMember === member.id ? 0.3 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Role-based Additional Content */}
        {userRole === 'admin' && (
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-8 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
              <h3 className="text-3xl font-bold text-blue-400 mb-4">
                Admin Access
              </h3>
              <p className="text-slate-300 text-lg">
                Access detailed team information, performance metrics, and direct communication channels.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bio Modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              className={`bg-gradient-to-br ${selectedMember.color} p-8 rounded-2xl max-w-2xl w-full shadow-2xl border border-white/20 backdrop-blur-xl`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mr-6 backdrop-blur-sm border border-white/30">
                  <span className="text-5xl">{selectedMember.avatar}</span>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white">{selectedMember.name}</h3>
                  <p className="text-white/80 text-xl">{selectedMember.role}</p>
                </div>
              </div>

              <p className="text-white/90 text-lg leading-relaxed mb-6">{selectedMember.bio}</p>

              <div className="mb-6">
                <h4 className="text-white font-bold text-lg mb-3">Areas of Expertise:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-white/20 text-white rounded-full border border-white/30 backdrop-blur-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <button
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-colors backdrop-blur-sm"
                onClick={() => setSelectedMember(null)}
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
