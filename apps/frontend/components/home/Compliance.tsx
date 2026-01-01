import React from 'react';

const features = [
  'Disbursement Triggers & Timelines',
  'Termination Clauses',
  'Jurisdiction & Refund Protocol',
  'Multi-Party Disbursement Logic'
];

const Compliance = ({ onPreviewAgreement }: { onPreviewAgreement: () => void }) => (
  <section className="py-16 bg-white/95">
    <div className="max-w-4xl mx-auto text-center mb-8">
      <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-gray-900">Formal Escrow Agreements, Backed by Law</h2>
    </div>
    <ul className="max-w-xl mx-auto mb-8 space-y-4 text-lg text-gray-800">
      {features.map((f, i) => (
        <li key={i} className="flex items-center gap-3">
          <span className="text-[#D4AF37] text-xl" aria-hidden="true">✔️</span>
          <span>{f}</span>
        </li>
      ))}
    </ul>
    <div className="flex justify-center mb-4">
      <button
        aria-label="Preview Escrow Agreement PDF"
        onClick={onPreviewAgreement}
        className="px-6 py-3 bg-[#D4AF37] text-[#1C2A39] font-semibold rounded-lg shadow hover:bg-[#bfa134] transition-colors"
      >
        Preview Agreement PDF
      </button>
    </div>
    <div className="text-xs text-gray-500 text-center">
      Regulated under UAE Financial Compliance Standards. All agreements are KYC/AML compliant.
    </div>
  </section>
);

export default Compliance; 