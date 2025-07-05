import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI-Powered Escrow & Paymaster Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Secure, transparent, and intelligent escrow services for high-value transactions
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">✅ Phase 1 Complete</h2>
            <ul className="text-left space-y-2 text-gray-600">
              <li>• Authentication & Access Control</li>
              <li>• Phone/Email OTP Verification</li>
              <li>• Wallet Login (Stubbed)</li>
              <li>• Role-Based Access Control</li>
              <li>• Zod Schema Validation</li>
              <li>• Firebase Cloud Functions</li>
              <li>• Responsive UI with Framer Motion</li>
              <li>• Dashboard Shell with Role Navigation</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">🚀 Ready for Phase 2</h2>
            <ul className="text-left space-y-2 text-gray-600">
              <li>• Escrow FSM Core Engine</li>
              <li>• Smart Contract Implementation</li>
              <li>• Deal Creation & Management</li>
              <li>• State Machine Transitions</li>
              <li>• On-chain Event Handling</li>
              <li>• Integration Testing</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/login" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="mr-2">🔐</span>
            Sign In
          </a>
          <a 
            href="/signup" 
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <span className="mr-2">📝</span>
            Create Account
          </a>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Built with Next.js, TypeScript, Tailwind CSS, Framer Motion, and Firebase</p>
          <p className="mt-2">Follows strict AI governance rules and blueprint compliance</p>
        </div>
      </div>
    </div>
  );
} 