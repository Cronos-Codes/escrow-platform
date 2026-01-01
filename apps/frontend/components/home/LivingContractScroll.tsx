import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useDeviceOptimization, useAnimationConfig } from '../../hooks/useDeviceOptimization';

const contractSections = [
  {
    section: 'Article I',
    title: 'Parties and Definitions',
    content: 'This Escrow Agreement ("Agreement") is entered into by and between the parties identified herein, with Gold Escrow acting as a licensed neutral third-party escrow agent under UAE Commercial Law.',
    terms: [
      { term: 'Neutral Third Party', definition: 'Licensed entity with no fiduciary duty to either party' },
      { term: 'Escrow Agent', definition: 'Gold Escrow licensed under UAE BAR' },
    ],
  },
  {
    section: 'Article II',
    title: 'Disbursement Triggers & Timelines',
    content: 'Funds held in escrow shall be released only upon satisfaction of predefined conditions verified by legal review. Disbursement triggers include but are not limited to: completion of contract terms, regulatory approval, and written consent of all parties.',
    terms: [
      { term: 'Disbursement Triggers', definition: 'Conditions that must be met before release' },
      { term: 'Legal Review', definition: 'Verification by licensed legal professionals' },
    ],
  },
  {
    section: 'Article III',
    title: 'Termination & Refund Protocol',
    content: 'In the event of contract termination, funds shall be returned in accordance with UAE law and the specific terms outlined herein. Termination clauses protect all parties and ensure fair resolution under legal supervision.',
    terms: [
      { term: 'Termination Clauses', definition: 'Conditions under which agreement may end' },
      { term: 'Refund Protocol', definition: 'Process for returning funds upon termination' },
    ],
  },
  {
    section: 'Article IV',
    title: 'Jurisdiction & Dispute Resolution',
    content: 'This Agreement is governed by UAE law and subject to the jurisdiction of DIFC Courts. Any disputes arising from this Agreement shall be resolved through arbitration in accordance with DIFC-LCIA rules.',
    terms: [
      { term: 'Jurisdiction', definition: 'UAE law and DIFC Courts' },
      { term: 'Arbitration', definition: 'DIFC-LCIA dispute resolution process' },
    ],
  },
  {
    section: 'Article V',
    title: 'Multi-Party Disbursement Logic',
    content: 'For transactions involving multiple beneficiaries, disbursement shall occur in accordance with the allocation schedule agreed upon by all parties. Each disbursement requires verification and multi-signatory approval where applicable.',
    terms: [
      { term: 'Multi-Party', definition: 'Transactions with more than two parties' },
      { term: 'Allocation Schedule', definition: 'Predetermined distribution of funds' },
    ],
  },
];

const LivingContractScroll = ({ onPreviewAgreement }: { onPreviewAgreement?: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const device = useDeviceOptimization();
  const animationConfig = useAnimationConfig();
  const [selectedTerm, setSelectedTerm] = useState<{ section: number; term: any } | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Calculate progress for each section
  const getSectionProgress = (index: number, total: number) => {
    const start = index / total;
    const end = (index + 1) / total;
    return useTransform(scrollYProgress, [start, end], [0, 1]);
  };

  return (
    <section
      ref={containerRef}
      className="py-20 sm:py-24 md:py-32 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden"
    >
      {/* Parchment texture overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzg4OCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={animationConfig.enableAnimations ? { opacity: 0, y: 30 } : {}}
          whileInView={animationConfig.enableAnimations ? { opacity: 1, y: 0 } : {}}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-block mb-4"
            initial={animationConfig.enableAnimations ? { scale: 0 } : {}}
            whileInView={animationConfig.enableAnimations ? { scale: 1 } : {}}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
          >
            <span className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">
              Legal Framework
            </span>
          </motion.div>
          <h2 className={`${device.isMobile ? 'text-3xl sm:text-4xl' : 'text-4xl md:text-5xl'} font-serif font-bold mb-4 text-gray-900`}>
            Formal Escrow Agreements
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-2">
            Every transaction is backed by comprehensive legal documentation
          </p>
          <p className="text-sm text-gray-500">
            Scroll to reveal the agreement structure
          </p>
        </motion.div>

        {/* Living Contract Document */}
        <div className="max-w-4xl mx-auto">
          <div className={`relative ${
            device.isLowEnd ? 'bg-white' : 'bg-gradient-to-br from-amber-50/80 to-white backdrop-blur-sm'
          } rounded-2xl shadow-2xl border-2 border-gold/20 overflow-hidden`}>
            {/* Document header */}
            <div className="bg-gradient-to-r from-gold/10 to-gold/5 border-b-2 border-gold/20 px-6 md:px-8 py-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2">
                    ESCROW AGREEMENT
                  </h3>
                  <p className="text-sm text-gray-600">
                    Governed by UAE Commercial Law | DIFC Jurisdiction
                  </p>
                </div>
                <div className="text-4xl md:text-5xl">⚖️</div>
              </div>
            </div>

            {/* Contract content - types out as you scroll */}
            <div className="px-6 md:px-8 py-8 space-y-8">
              {contractSections.map((section, index) => (
                <ContractSection
                  key={index}
                  section={section}
                  index={index}
                  progress={getSectionProgress(index, contractSections.length)}
                  onTermClick={(term) => setSelectedTerm({ section: index, term })}
                  device={device}
                />
              ))}

              {/* Signature section - appears last */}
              <SignatureSection 
                progress={getSectionProgress(contractSections.length - 1, contractSections.length)} 
                device={device}
              />
            </div>

            {/* Wax seal decoration */}
            <motion.div
              className="absolute bottom-8 right-8 w-16 h-16 md:w-20 md:h-20"
              style={{
                opacity: getSectionProgress(contractSections.length - 1, contractSections.length),
                scale: useTransform(
                  getSectionProgress(contractSections.length - 1, contractSections.length),
                  [0, 1],
                  [0, 1]
                ),
              }}
            >
              <div className="relative w-full h-full bg-gradient-to-br from-gold to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl md:text-3xl text-white">⚜️</span>
                <div className="absolute inset-0 rounded-full border-4 border-gold/30" />
              </div>
            </motion.div>
          </div>

          {/* CTA Buttons */}
          <motion.div
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={animationConfig.enableAnimations ? { opacity: 0, y: 20 } : {}}
            whileInView={animationConfig.enableAnimations ? { opacity: 1, y: 0 } : {}}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {onPreviewAgreement && (
              <button
                onClick={onPreviewAgreement}
                className="px-6 md:px-8 py-3 bg-gold text-navy font-semibold rounded-lg shadow-lg hover:shadow-gold transition-all hover:scale-105"
              >
                Preview Full Agreement PDF
              </button>
            )}
            <button className="px-6 md:px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-gold">
              Request Custom Agreement
            </button>
          </motion.div>

          {/* Compliance note */}
          <motion.div
            className="mt-8 text-center"
            initial={animationConfig.enableAnimations ? { opacity: 0 } : {}}
            whileInView={animationConfig.enableAnimations ? { opacity: 1 } : {}}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <p className="text-xs text-gray-500 leading-relaxed max-w-2xl mx-auto">
              All agreements are KYC/AML compliant and subject to legal review. 
              Regulated under UAE Financial Compliance Standards and DIFC Courts.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Term definition modal */}
      {selectedTerm && (
        <TermModal
          term={selectedTerm.term}
          onClose={() => setSelectedTerm(null)}
          device={device}
        />
      )}
    </section>
  );
};

interface ContractSectionProps {
  section: typeof contractSections[0];
  index: number;
  progress: any;
  onTermClick: (term: any) => void;
  device: any;
}

const ContractSection = ({ section, index, progress, onTermClick, device }: ContractSectionProps) => {
  return (
    <motion.div
      className="border-l-4 border-gold/30 pl-6"
      style={{
        opacity: progress,
        y: useTransform(progress, [0, 1], [20, 0]),
      }}
    >
      {/* Section header */}
      <div className="mb-3">
        <span className="text-xs uppercase tracking-wider text-gold font-semibold">
          {section.section}
        </span>
        <h4 className="text-lg md:text-xl font-bold text-gray-900 mt-1">
          {section.title}
        </h4>
      </div>

      {/* Section content with typewriter effect simulation */}
      <motion.p
        className="text-sm md:text-base text-gray-700 leading-relaxed mb-4 font-serif"
        style={{
          opacity: progress,
        }}
      >
        {section.content}
      </motion.p>

      {/* Highlighted terms */}
      <div className="flex flex-wrap gap-2">
        {section.terms.map((term, i) => (
          <motion.button
            key={i}
            className="inline-flex items-center gap-1 text-xs bg-gold/10 hover:bg-gold/20 text-gold px-3 py-1.5 rounded-full border border-gold/30 transition-colors cursor-pointer"
            onClick={() => onTermClick(term)}
            style={{
              opacity: useTransform(progress, [0.5, 1], [0, 1]),
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>📖</span>
            <span className="font-medium">{term.term}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

interface SignatureSectionProps {
  progress: any;
  device: any;
}

const SignatureSection = ({ progress, device }: SignatureSectionProps) => {
  return (
    <motion.div
      className="border-t-2 border-gray-200 pt-8 mt-8"
      style={{
        opacity: progress,
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Party signatures */}
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Party Signatures</p>
          <div className="space-y-4">
            <SignatureLine label="Buyer / Depositor" progress={progress} />
            <SignatureLine label="Seller / Beneficiary" progress={progress} />
          </div>
        </div>

        {/* Escrow agent */}
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Escrow Agent</p>
          <SignatureLine label="Gold Escrow (Licensed Agent)" progress={progress} withSeal />
        </div>
      </div>
    </motion.div>
  );
};

interface SignatureLineProps {
  label: string;
  progress: any;
  withSeal?: boolean;
}

const SignatureLine = ({ label, progress, withSeal }: SignatureLineProps) => {
  return (
    <div>
      <motion.div
        className="border-b-2 border-gray-300 pb-2 mb-1"
        style={{
          scaleX: progress,
          transformOrigin: 'left',
        }}
      >
        <span className="text-lg font-serif italic text-gray-600">
          {/* Signature placeholder */}
        </span>
      </motion.div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">{label}</p>
        {withSeal && (
          <motion.span
            className="text-gold text-xs"
            style={{ opacity: progress }}
          >
            🔒 Verified
          </motion.span>
        )}
      </div>
    </div>
  );
};

interface TermModalProps {
  term: any;
  onClose: () => void;
  device: any;
}

const TermModal = ({ term, onClose, device }: TermModalProps) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`${
          device.isLowEnd ? 'bg-white' : 'bg-white/95 backdrop-blur-lg'
        } rounded-xl p-6 md:p-8 max-w-md w-full shadow-2xl border-2 border-gold/20`}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <h4 className="text-xl font-bold text-gray-900">{term.term}</h4>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
            aria-label="Close definition"
          >
            ×
          </button>
        </div>
        <p className="text-base text-gray-700 leading-relaxed">
          {term.definition}
        </p>
        <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
          <span>⚖️</span>
          <span>Defined under UAE Commercial Law</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LivingContractScroll;


