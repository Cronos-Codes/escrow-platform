import React from 'react';

const highlights = [
  'BAR-licensed neutral third party',
  'ISO 27001:2022 certified security',
  'Global KYC/AML compliance',
  'No representation of buyers or sellers',
  'Regulated by UAE Financial Authorities'
];

const LegalTrust = () => (
  <section className="py-16 bg-white/90">
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <ul className="space-y-4 text-lg text-gray-800">
        {highlights.map((h, i) => (
          <li key={i} className="flex items-center gap-3">
            <span className="text-[#D4AF37] text-xl" aria-hidden="true">✔️</span>
            <span>{h}</span>
          </li>
        ))}
      </ul>
      <div className="relative bg-gradient-to-br from-[#D4AF37]/10 to-white rounded-xl p-8 shadow-lg flex flex-col items-start">
        <span className="absolute -top-6 left-2 text-6xl text-[#D4AF37] opacity-60 select-none" aria-hidden="true">"</span>
        <blockquote className="text-xl font-serif text-gray-900 mb-4">
          As a licensed neutral third party, we do not represent buyers or sellers — only the law.
        </blockquote>
        <div className="flex gap-4 items-center mt-4">
          <span className="inline-block w-16 h-8 bg-gray-200 rounded shadow-inner" title="Trustpilot (placeholder)"></span>
          <span className="inline-block w-12 h-8 bg-gray-200 rounded shadow-inner" title="BAR License (placeholder)"></span>
          <span className="inline-block w-12 h-8 bg-gray-200 rounded shadow-inner" title="ISO Badge (placeholder)"></span>
        </div>
      </div>
    </div>
  </section>
);

export default LegalTrust; 