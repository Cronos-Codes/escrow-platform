import React, { useState, useEffect, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Layout from '../components/shared/Layout';
import { HeroConciergeSection } from '../components/contact/HeroConciergeSection';
import { ContactOptionsSection } from '../components/contact/ContactOptionsSection';
import { InteractiveFormSection } from '../components/contact/InteractiveFormSection';
import { LiveSupportWidget } from '../components/contact/LiveSupportWidget';
import { GlobalOfficesMapSection } from '../components/contact/GlobalOfficesMapSection';
import { CTAFooter } from '../components/contact/CTAFooter';

const ContactPage: React.FC = () => {
  const { data: session } = useSession();
  const { scrollYProgress } = useScroll();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Optimized parallax transforms with reduced motion support
  const heroY = useTransform(scrollYProgress, [0, 1], [0, isMobile ? -100 : -300]);
  const optionsY = useTransform(scrollYProgress, [0, 0.5], [0, isMobile ? -50 : -100]);
  const formY = useTransform(scrollYProgress, [0.2, 0.7], [0, isMobile ? -75 : -150]);
  const mapY = useTransform(scrollYProgress, [0.4, 0.9], [0, isMobile ? -50 : -100]);

  // Memoized user role calculation
  const { userRole, isLoggedIn } = useMemo(() => ({
    userRole: (session?.user as any)?.role || 'guest',
    isLoggedIn: !!session?.user
  }), [session]);

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Optimized loading with reduced delay
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Head>
        <title>Contact Gold Escrow - Secure Financial Services | 24/7 AI Concierge</title>
        <meta name="description" content="Contact Gold Escrow for secure escrow services. AI-powered concierge available 24/7. Get instant support for high-value transactions, blockchain assistance, and partnership opportunities." />
        <meta name="keywords" content="contact escrow service, secure financial contact, gold escrow support, AI concierge, blockchain support, escrow consultation" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Contact Gold Escrow - Secure Financial Services" />
        <meta property="og:description" content="Get instant support from our AI concierge or speak with our human experts. Available 24/7 for all your escrow needs." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://goldescrow.com/contact" />
        <link rel="canonical" href="https://goldescrow.com/contact" />
      </Head>

      <Layout fullWidth className="overflow-hidden">
        <div className="relative min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1C2A39] to-[#141414]">
          {/* Enhanced Background Particles with Performance Optimization */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[url('/patterns/hexagon.svg')] opacity-5 animate-pulse" />
            
            {/* Optimized particle count based on device */}
            {!isMobile && (
              <>
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-20" />
                <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-yellow-300 rounded-full animate-pulse opacity-30" />
                <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce opacity-25" />
                <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-yellow-400 rounded-full animate-pulse opacity-20" />
              </>
            )}
          </div>

          <AnimatePresence>
            {isLoaded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10"
              >
                {/* Hero Concierge Section */}
                <motion.div 
                  style={{ y: heroY }}
                  className="will-change-transform"
                >
                  <HeroConciergeSection userRole={userRole} isLoggedIn={isLoggedIn} />
                </motion.div>

                {/* Contact Options Section */}
                <motion.div 
                  style={{ y: optionsY }}
                  className="will-change-transform"
                >
                  <ContactOptionsSection userRole={userRole} />
                </motion.div>

                {/* Interactive Form Section */}
                <motion.div 
                  style={{ y: formY }}
                  className="will-change-transform"
                >
                  <InteractiveFormSection userRole={userRole} />
                </motion.div>

                {/* Global Offices Map Section */}
                <motion.div 
                  style={{ y: mapY }}
                  className="will-change-transform"
                >
                  <GlobalOfficesMapSection userRole={userRole} />
                </motion.div>

                {/* CTA Footer */}
                <CTAFooter userRole={userRole} isLoggedIn={isLoggedIn} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live Support Widget - Fixed Position */}
          <LiveSupportWidget userRole={userRole} />
        </div>
      </Layout>
    </>
  );
};

export default ContactPage;


