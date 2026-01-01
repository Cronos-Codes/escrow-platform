import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../components/shared/Layout';
import HeroSection from '../components/features/HeroSection';
import FeaturesDeckSection from '../components/features/FeaturesDeckSection';
import AIFlowStrip from '../components/features/AIFlowStrip';
import BlockchainLedger from '../components/features/BlockchainLedger';
import AIvsHumanArbitration from '../components/features/AIvsHumanArbitration';
import PaymasterSection from '../components/features/PaymasterSection';
import FooterCTA from '../components/features/FooterCTA';
import ParticleBackground from '../components/features/ParticleBackground';

const FeaturesPage = () => {
  const { data: session, status } = useSession();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const userRole = session?.user?.role || 'guest';

  return (
    <Layout>
      <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
        {/* Animated Background */}
        <ParticleBackground />
        
        {/* Hero Section */}
        <HeroSection userRole={userRole} />
        
        {/* Features Deck Section */}
        <FeaturesDeckSection userRole={userRole} isLoaded={isLoaded} />
        
        {/* AI Flow Strip */}
        <AIFlowStrip userRole={userRole} />
        
        {/* Blockchain Ledger Visual */}
        <BlockchainLedger userRole={userRole} />
        
        {/* AI vs Human Arbitration */}
        <AIvsHumanArbitration userRole={userRole} />
        
        {/* Paymaster Section */}
        <PaymasterSection userRole={userRole} />
        
        {/* Footer CTA */}
        <FooterCTA userRole={userRole} />
      </div>
    </Layout>
  );
};

export default FeaturesPage;
