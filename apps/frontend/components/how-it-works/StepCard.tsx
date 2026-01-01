import React from 'react';
import { motion } from 'framer-motion';
import { IconType } from 'react-icons';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: IconType;
  color: string;
  animationDelay: number;
}

interface StepCardProps {
  step: Step;
  index: number;
  totalSteps: number;
}

const StepCard: React.FC<StepCardProps> = ({ step, index, totalSteps }) => {
  const IconComponent = step.icon;

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.8, 
        delay: step.animationDelay,
        ease: "easeOut"
      }}
      viewport={{ once: true }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
    >
      {/* Connection Line to Globe */}
      <motion.div
        className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-px h-8 bg-gradient-to-b from-transparent to-gold-400"
        initial={{ height: 0 }}
        whileInView={{ height: 32 }}
        transition={{ 
          duration: 0.8, 
          delay: step.animationDelay + 0.3 
        }}
        viewport={{ once: true }}
      />

      {/* Step Number Badge */}
      <motion.div
        className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-gold-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10"
        initial={{ scale: 0, rotate: -180 }}
        whileInView={{ scale: 1, rotate: 0 }}
        transition={{ 
          duration: 0.6, 
          delay: step.animationDelay + 0.2,
          type: "spring",
          stiffness: 200
        }}
        viewport={{ once: true }}
      >
        {step.id}
      </motion.div>

      {/* Main Card */}
      <motion.div
        className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 hover:border-gold-400 transition-all duration-300 relative overflow-hidden group-hover:shadow-2xl group-hover:shadow-gold-500/20"
        whileHover={{ 
          y: -5,
          transition: { duration: 0.2 }
        }}
      >
        {/* Background Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Icon Container */}
        <motion.div
          className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center mb-4 relative z-10`}
          whileHover={{ 
            scale: 1.1,
            rotate: 5,
            transition: { duration: 0.2 }
          }}
        >
          <IconComponent className="text-white text-2xl" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gold-400 transition-colors duration-300">
            {step.title}
          </h3>
          <p className="text-gray-300 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />

        {/* Progress Indicator */}
        {index < totalSteps - 1 && (
          <motion.div
            className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-px h-8 bg-gradient-to-b from-gold-400 to-transparent"
            initial={{ height: 0 }}
            whileInView={{ height: 32 }}
            transition={{ 
              duration: 0.8, 
              delay: step.animationDelay + 0.5 
            }}
            viewport={{ once: true }}
          />
        )}
      </motion.div>

      {/* Floating Particles */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gold-400 rounded-full"
            style={{
              left: `${20 + i * 30}%`,
              top: `${10 + i * 20}%`,
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default StepCard;
