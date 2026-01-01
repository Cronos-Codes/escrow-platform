import React, { useState, useRef } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@escrow/ui';
import { DraggableComplianceCards } from './DraggableComplianceCards';

interface TrustComplianceSectionProps {
  userRole: string;
  isLoggedIn: boolean;
}

export const TrustComplianceSection: React.FC<TrustComplianceSectionProps> = ({ userRole, isLoggedIn }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const [selectedCompliance, setSelectedCompliance] = useState<string | null>(null);

  // Transform scroll progress for parallax effects
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  // Enhanced compliance certifications with progressive reveal data
  const complianceItems = [
    {
      id: "uae-bar",
      title: "UAE BAR Licensed",
      subtitle: "Legal Authorization • Active Since 2024",
      description: "Fully licensed legal escrow services by the UAE Bar Association with professional regulatory oversight and compliance.",
      details: "Our legal team is registered with the UAE Bar Association, ensuring all escrow services comply with local legal requirements and professional standards.",
      extendedDetails: "License #UAE-BAR-2024-ESC-001 | Valid through 2025 | Professional indemnity insurance: $50M | Regular compliance audits conducted quarterly | Direct liaison with UAE regulatory authorities",
      icon: "⚖️",
      gradientFrom: "from-blue-500/30",
      gradientTo: "to-blue-700/30",
      borderColor: "border-blue-400/50",
      textColor: "text-blue-400",
      accentColor: "bg-blue-400"
    },
    {
      id: "aml-kyc",
      title: "AML/KYC Compliant",
      subtitle: "Financial Intelligence • Real-time Monitoring",
      description: "Advanced anti-money laundering and identity verification systems protecting against financial crimes.",
      details: "We implement rigorous AML/KYC procedures to verify all parties involved in transactions, ensuring compliance with international financial regulations and preventing illicit activities.",
      extendedDetails: "FATCA compliant | CRS reporting | Real-time sanctions screening | Enhanced due diligence for high-risk transactions | Transaction monitoring using AI/ML algorithms | Regular staff training and certification",
      icon: "🔍",
      gradientFrom: "from-green-500/30",
      gradientTo: "to-emerald-700/30",
      borderColor: "border-green-400/50",
      textColor: "text-green-400",
      accentColor: "bg-green-400"
    },
    {
      id: "iso-27001",
      title: "ISO 27001 Certified",
      subtitle: "Information Security • Global Standard",
      description: "International certification for information security management with enterprise-grade protection protocols.",
      details: "Our platform meets the highest international standards for information security management, protecting all client data and transaction information with enterprise-grade security measures.",
      extendedDetails: "Certificate #ISO27001-2024-GE-7789 | Annual surveillance audits | 256-bit AES encryption | Zero-trust architecture | SOC 2 Type II compliant | Penetration testing quarterly | GDPR compliant data handling",
      icon: "🔐",
      gradientFrom: "from-purple-500/30",
      gradientTo: "to-violet-700/30",
      borderColor: "border-purple-400/50",
      textColor: "text-purple-400",
      accentColor: "bg-purple-400"
    },
    {
      id: "difc",
      title: "DIFC Regulated",
      subtitle: "Dubai Authority • Financial Services",
      description: "Regulated by Dubai International Financial Centre with comprehensive oversight and client protection.",
      details: "Operating under DIFC regulation provides additional oversight and compliance requirements, ensuring the highest standards of financial services and client protection in the region.",
      extendedDetails: "DIFC License #F002847 | Category 4 - Providing Trust Services | Authorized by DFSA | Annual compliance reporting | Client money protection rules | Professional indemnity coverage: $25M UAE market focus",
      icon: "🏛️",
      gradientFrom: "from-yellow-500/30",
      gradientTo: "to-amber-700/30",
      borderColor: "border-yellow-400/50",
      textColor: "text-yellow-400",
      accentColor: "bg-yellow-400"
    }
  ];

  return (
    <section 
      ref={ref}
      className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Animated Grid */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fillRule="evenodd">
            <g stroke="#FFFFFF" strokeOpacity="0.1">
              <path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/>
            </g>
          </g>
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          style={{ y, opacity, scale }}
          className="text-center mb-16"
        >
          {/* Section Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-400/20 to-blue-400/20 border border-purple-400/30 rounded-full text-purple-400 text-sm font-medium mb-8 backdrop-blur-sm"
          >
            <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse" />
            Trust & Compliance
          </motion.div>

          {/* Main Title */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Regulated Excellence
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed"
          >
            Built on a foundation of regulatory compliance and industry-leading security standards
          </motion.p>
        </motion.div>

        {/* Draggable Compliance Vault */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.6 }}
          className="mb-16"
        >
          <DraggableComplianceCards 
            complianceItems={complianceItems} 
            isLoggedIn={isLoggedIn}
          />
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 1.2 }}
          className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl backdrop-blur-xl p-8 mb-16"
        >
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Trust Indicators
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">99.9%</div>
              <div className="text-slate-300">Uptime Guarantee</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">24/7</div>
              <div className="text-slate-300">Support Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">256-bit</div>
              <div className="text-slate-300">SSL Encryption</div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl backdrop-blur-xl p-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Experience Secure Transactions?
            </h3>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who trust Gold Escrow for their most critical transactions. 
              Get started today with our fully compliant and secure platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="primary"
                      size="lg"
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold px-8 py-4 rounded-xl shadow-2xl hover:shadow-yellow-400/25 transition-all duration-300"
                    >
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link href="/escrow/create">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-bold px-8 py-4 rounded-xl transition-all duration-300"
                    >
                      Create Escrow
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth">
                    <Button
                      variant="primary"
                      size="lg"
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold px-8 py-4 rounded-xl shadow-2xl hover:shadow-yellow-400/25 transition-all duration-300"
                    >
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-bold px-8 py-4 rounded-xl transition-all duration-300"
                    >
                      Contact Us
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
