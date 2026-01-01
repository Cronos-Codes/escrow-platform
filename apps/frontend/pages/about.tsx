import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Layout from '../components/shared/Layout';
import { VaultHeroSection } from '../components/about/VaultHeroSection';
import { MissionSection } from '../components/about/MissionSection';
import { GlobalImpactSection } from '../components/about/GlobalImpactSection';
import { TrustComplianceSection } from '../components/about/TrustComplianceSection';

const AboutPage: React.FC = () => {
  const { data: session } = useSession();
  const { scrollYProgress } = useScroll();
  const [isLoaded, setIsLoaded] = useState(false);

  // Transform scroll progress for parallax effects
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const missionY = useTransform(scrollYProgress, [0.2, 0.7], [0, -150]);
  const globalY = useTransform(scrollYProgress, [0.4, 0.9], [0, -100]);
  const trustY = useTransform(scrollYProgress, [0.6, 1], [0, -50]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Determine user role for content variations
  const userRole = (session?.user as any)?.role || 'guest';
  const isLoggedIn = !!session?.user;

  return (
    <>
      <Head>
        <title>About Gold Escrow | Licensed Legal Escrow Platform | UAE Regulated</title>
        <meta 
          name="description" 
          content="Discover Gold Escrow's mission to revolutionize secure transactions. Licensed by UAE BAR, AML/KYC compliant, ISO 27001 certified. Trusted by legal professionals worldwide." 
        />
        <meta 
          name="keywords" 
          content="legal escrow, UAE regulated, KYC compliance, fiduciary services, secure transactions, blockchain escrow, Gold Escrow, licensed escrow platform" 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Open Graph */}
        <meta property="og:title" content="About Gold Escrow | Licensed Legal Escrow Platform" />
        <meta property="og:description" content="Discover Gold Escrow's mission to revolutionize secure transactions. Licensed by UAE BAR, AML/KYC compliant, ISO 27001 certified." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://goldescrow.com/about" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Gold Escrow | Licensed Legal Escrow Platform" />
        <meta name="twitter:description" content="Discover Gold Escrow's mission to revolutionize secure transactions." />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Gold Escrow",
              "description": "Licensed legal escrow platform for secure transactions",
              "url": "https://goldescrow.com",
              "logo": "https://goldescrow.com/logo.png",
              "sameAs": [
                "https://linkedin.com/company/goldescrow",
                "https://twitter.com/goldescrow"
              ],
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "UAE"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Escrow Services",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Legal Escrow Services"
                    }
                  }
                ]
              },
              "award": [
                "UAE BAR Licensed",
                "AML/KYC Compliant",
                "ISO 27001 Certified",
                "DIFC Regulated"
              ]
            })
          }}
        />
      </Head>

      <Layout fullWidth className="overflow-hidden">
        <div className="relative min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1C2A39] to-[#141414]">
          {/* Background Particles */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[url('/patterns/hexagon.svg')] opacity-5 animate-pulse" />
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-20" />
            <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-yellow-300 rounded-full animate-pulse opacity-30" />
            <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce opacity-25" />
          </div>

          <AnimatePresence>
            {isLoaded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="relative z-10"
              >
                {/* Section 1: Hero Section - "The Vault of Trust" */}
                <motion.div style={{ y: heroY }}>
                  <VaultHeroSection userRole={userRole} isLoggedIn={isLoggedIn} />
                </motion.div>

                {/* Section 2: Mission Section - "Beyond Escrow" */}
                <motion.div style={{ y: missionY }}>
                  <MissionSection userRole={userRole} isLoggedIn={isLoggedIn} />
                </motion.div>

                {/* Section 3: Global Impact Section - "Worldwide Trust" */}
                <motion.div style={{ y: globalY }}>
                  <GlobalImpactSection userRole={userRole} isLoggedIn={isLoggedIn} />
                </motion.div>

                {/* Section 4: Trust & Compliance Section - "Regulated Excellence" */}
                <motion.div style={{ y: trustY }}>
                  <TrustComplianceSection userRole={userRole} isLoggedIn={isLoggedIn} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Layout>
    </>
  );
};

export default AboutPage;
