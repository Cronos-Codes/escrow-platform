import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/shared/Layout';

const PrivacyPolicyPage: React.FC = () => {
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
            Privacy Policy
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> December 2024
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Information We Collect
              </h2>
              <p className="text-gray-700 mb-4">
                We collect information you provide directly to us, such as when you create an account, complete transactions, or contact us for support.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Personal identification information (name, email, phone number)</li>
                <li>Business information (company name, position, address)</li>
                <li>KYC documents and verification data</li>
                <li>Transaction history and escrow details</li>
                <li>Device and usage information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. How We Use Your Information
              </h2>
              <p className="text-gray-700 mb-4">
                We use the information we collect to provide, maintain, and improve our services:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Process transactions and escrow services</li>
                <li>Verify your identity and comply with KYC/AML requirements</li>
                <li>Provide customer support and resolve disputes</li>
                <li>Send important updates and notifications</li>
                <li>Improve our platform and develop new features</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Information Sharing
              </h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>With your consent or at your direction</li>
                <li>To comply with legal obligations or court orders</li>
                <li>To protect our rights, property, or safety</li>
                <li>With service providers who assist in our operations</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Data Security
              </h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Data Retention
              </h2>
              <p className="text-gray-700 mb-4">
                We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Your Rights
              </h2>
              <p className="text-gray-700 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Access and review your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your personal information</li>
                <li>Object to processing of your personal information</li>
                <li>Request restriction of processing</li>
                <li>Data portability</li>
                <li>Withdraw consent where processing is based on consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Contact Us
              </h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@goldescrow.com<br />
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

export default PrivacyPolicyPage; 