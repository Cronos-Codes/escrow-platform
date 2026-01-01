import React from 'react';
import { motion } from 'framer-motion';
import { IconType } from 'react-icons';

interface Feature {
  title: string;
  description: string;
  icon: IconType;
  color: string;
}

interface FeatureCardProps {
  feature: Feature;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, index }) => {
  const IconComponent = feature.icon;

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      viewport={{ once: true }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      {/* Background Glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-gold-500/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(45deg, transparent 0%, rgba(255, 215, 0, 0.1) 50%, transparent 100%)`
        }}
      />

      {/* Main Card */}
      <motion.div
        className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 hover:border-gold-400/50 transition-all duration-300 overflow-hidden"
        whileHover={{ 
          y: -8,
          transition: { duration: 0.3 }
        }}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-gold-400 via-transparent to-gold-400 animate-pulse" />
        </div>

        {/* Icon Container */}
        <motion.div
          className={`relative z-10 w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 shadow-lg`}
          whileHover={{ 
            scale: 1.1,
            rotate: [0, -5, 5, 0],
            transition: { 
              duration: 0.4,
              rotate: { duration: 0.2 }
            }
          }}
        >
          <IconComponent className="text-white text-xl" />
          
          {/* Icon Glow Effect */}
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent"
            animate={{
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.2,
            }}
          />
        </motion.div>

        {/* Content */}
        <div className="relative z-10">
          <h3 className="text-lg font-bold text-white mb-3 group-hover:text-gold-400 transition-colors duration-300">
            {feature.title}
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {feature.description}
          </p>
        </div>

        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.8 }}
        />

        {/* Corner Accent */}
        <motion.div
          className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-gold-500/20 to-transparent rounded-bl-xl"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Floating Elements */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Sparkle Effect */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gold-400 rounded-full"
              style={{
                left: `${15 + i * 20}%`,
                top: `${20 + i * 15}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}

          {/* Connection Lines */}
          <motion.div
            className="absolute top-1/2 left-0 w-px h-0 bg-gradient-to-b from-transparent via-gold-400 to-transparent"
            initial={{ height: 0 }}
            whileHover={{ height: '100%' }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
          <motion.div
            className="absolute top-0 left-1/2 w-0 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent"
            initial={{ width: 0 }}
            whileHover={{ width: '100%' }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
        </motion.div>
      </motion.div>

      {/* Bottom Glow */}
      <motion.div
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-2 bg-gradient-to-r from-transparent via-gold-500/30 to-transparent rounded-full blur-sm"
        initial={{ opacity: 0, scaleX: 0 }}
        whileHover={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default FeatureCard;
