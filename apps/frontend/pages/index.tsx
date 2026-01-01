import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/shared/Layout';
import Hero from '../components/home/Hero';
import UseCases from '../components/home/UseCases';
import Testimonials from '../components/home/Testimonials';
import ContactCTA from '../components/home/ContactCTA';
import StatsBanner from '../components/home/StatsBanner';
import CaseStudies from '../components/home/CaseStudies';
import FAQs from '../components/home/FAQs';
import RegulatoryBadgeStrip from '../components/home/RegulatoryBadgeStrip';
import TrustSignals from '../components/home/TrustSignals';
import TrustedBy from '../components/home/TrustedBy';
import AuthModal from '@escrow/ui/src/components/modals/AuthModal';
import FluidBackground from '../components/shared/FluidBackground';
// New interactive sections
import IndustryPortalGrid from '../components/home/IndustryPortalGrid';
import TrustShieldVisualizer from '../components/home/TrustShieldVisualizer';
import LivingContractScroll from '../components/home/LivingContractScroll';

// Mock data highlights based on GlobalHeatmap mockData
const dataHighlights = [
  { x: 0.25, y: 0.35, intensity: 1 }, // UAE
  { x: 0.65, y: 0.55, intensity: 0.7 }, // UK
  { x: 0.55, y: 0.45, intensity: 0.5 }, // India
];

export default function HomePage() {
  const [contactOpen, setContactOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <FluidBackground
      enablePatternOverlay
      enableDataHighlights
      dataHighlights={dataHighlights}
      enableAmbientGlow
      enableParallax
      colorful={true}
      bloomEnabled={true}
      sunraysEnabled={true}
      backgroundColor="#1C2A39"
    >
      <Layout>
        <Head>
          <title>Gold Escrow | Licensed Legal Escrow Platform</title>
          <meta name="description" content="Licensed, regulated escrow for real estate, commodities, and complex transactions. KYC/AML compliant. Trusted by legal professionals." />
          <meta name="keywords" content="escrow, legal escrow, KYC, fiduciary, compliance, UAE, real estate, commodities, paymaster, neutral, regulated, law" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="snap-section">
          <Hero onOpenContact={() => setContactOpen(true)} onOpenAuth={() => setAuthModalOpen(true)} />
        </div>
        <div className="snap-section hw-accelerate">
          <TrustedBy />
        </div>
        <div className="snap-section hw-accelerate">
          <StatsBanner />
        </div>
        {/* New Interactive Sections */}
        <div className="snap-section hw-accelerate">
          <IndustryPortalGrid />
        </div>
        <div className="snap-section hw-accelerate">
          <TrustShieldVisualizer />
        </div>
        <div className="snap-section hw-accelerate">
          <LivingContractScroll onPreviewAgreement={() => setPdfOpen(true)} />
        </div>
        {/* Existing Sections */}
        <div className="snap-section hw-accelerate">
          <UseCases />
        </div>
        <div className="snap-section hw-accelerate">
          <CaseStudies />
        </div>
        <div className="snap-section hw-accelerate">
          <Testimonials />
        </div>
        <div className="snap-section hw-accelerate">
          <FAQs />
        </div>
        <div className="snap-section hw-accelerate">
          <RegulatoryBadgeStrip />
        </div>
        <div className="snap-section hw-accelerate">
          <TrustSignals />
        </div>
        <div className="snap-section">
          <ContactCTA onOpen={() => setContactOpen(true)} />
        </div>
        {/* Contact Modal Placeholder */}
        {contactOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl p-8 max-w-md w-full relative">
              <button aria-label="Close contact form" className="absolute top-2 right-2 text-gray-500" onClick={() => setContactOpen(false)}>&times;</button>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Contact Legal Team</h3>
              <form className="space-y-4">
                <input className="w-full border rounded p-2" placeholder="Name" required />
                <input className="w-full border rounded p-2" placeholder="Email" type="email" required />
                <input className="w-full border rounded p-2" placeholder="Country" required />
                <input className="w-full border rounded p-2" placeholder="Type of Transaction" required />
                <input className="w-full border rounded p-2" placeholder="Schedule (optional)" />
                <button type="submit" className="w-full bg-[#D4AF37] text-[#1C2A39] font-semibold rounded-lg py-2 mt-2">Submit</button>
              </form>
            </div>
          </div>
        )}
        {/* PDF Preview Modal Placeholder */}
        {pdfOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full relative">
              <button aria-label="Close PDF preview" className="absolute top-2 right-2 text-gray-500" onClick={() => setPdfOpen(false)}>&times;</button>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Escrow Agreement Preview</h3>
              <div className="h-96 flex items-center justify-center text-gray-400">PDF Viewer Placeholder</div>
            </div>
          </div>
        )}
        {/* Unified Auth Modal overlay */}
        <AuthModal
          open={authModalOpen}
          onOpenChange={setAuthModalOpen}
          initialTab="email"
          initialMode="signup"
        />
      </Layout>
    </FluidBackground>
  );
} 