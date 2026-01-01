import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/shared/Layout';

const TermsOfServicePage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Terms of Service
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> December 2024
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 mb-4">
                By accessing and using the Gold Escrow Platform, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Description of Service
              </h2>
              <p className="text-gray-700 mb-4">
                Gold Escrow Platform provides secure escrow services for various types of transactions, including but not limited to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Real estate transactions</li>
                <li>Precious metals trading</li>
                <li>Oil and gas contracts</li>
                <li>Other high-value commercial transactions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. User Responsibilities
              </h2>
              <p className="text-gray-700 mb-4">
                As a user of our platform, you agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Maintain the security of your account</li>
                <li>Not engage in fraudulent or illegal activities</li>
                <li>Pay all applicable fees and charges</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Escrow Process
              </h2>
              <p className="text-gray-700 mb-4">
                Our escrow process includes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Secure fund holding during transaction</li>
                <li>Verification of transaction conditions</li>
                <li>Dispute resolution services</li>
                <li>Automated release upon satisfaction of conditions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Fees and Charges
              </h2>
              <p className="text-gray-700 mb-4">
                Users are responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Escrow service fees</li>
                <li>Transaction processing fees</li>
                <li>Gas fees for blockchain transactions</li>
                <li>Any additional service charges</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Dispute Resolution
              </h2>
              <p className="text-gray-700 mb-4">
                In the event of disputes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Our platform provides automated dispute resolution</li>
                <li>Arbitrators may be assigned for complex cases</li>
                <li>Decisions are binding and final</li>
                <li>Legal recourse is available in accordance with UAE law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Limitation of Liability
              </h2>
              <p className="text-gray-700 mb-4">
                Gold Escrow Platform's liability is limited to the amount of fees paid for the specific transaction in dispute. We are not liable for indirect, incidental, or consequential damages.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Governing Law
              </h2>
              <p className="text-gray-700 mb-4">
                These terms are governed by the laws of the United Arab Emirates. Any disputes shall be resolved in the courts of Dubai International Financial Centre.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Contact Information
              </h2>
              <p className="text-gray-700 mb-4">
                For questions about these terms, contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@goldescrow.com<br />
                  <strong>Address:</strong> Gold Escrow Platform<br />
                  Dubai International Financial Centre<br />
                  Dubai, United Arab Emirates
                </p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default TermsOfServicePage; 