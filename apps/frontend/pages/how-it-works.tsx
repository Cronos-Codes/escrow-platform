import React from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { 
  FaGlobe, 
  FaShieldAlt, 
  FaChartLine, 
  FaHandshake, 
  FaExclamationTriangle,
  FaRocket,
  FaLock,
  FaEye,
  FaUsers,
  FaCog
} from 'react-icons/fa';
import Layout from '../components/shared/Layout';
import GlobeWidget from '../components/globe/GlobeWidget';
import StepCard from '../components/how-it-works/StepCard';
import FeatureCard from '../components/how-it-works/FeatureCard';
import AdminDashboardMockup from '../components/how-it-works/AdminDashboardMockup';
import { useEscrowData } from '../hooks/useEscrowData';

const HowItWorksPage: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { escrows, loading } = useEscrowData();

  const steps = [
    {
      id: 1,
      title: "Create Escrow",
      description: "User inputs deal info (counterparty, amount, deadline). AI validates terms and prepares blockchain transaction.",
      icon: FaHandshake,
      color: "from-blue-500 to-cyan-500",
      animationDelay: 0.1
    },
    {
      id: 2,
      title: "AI Lock",
      description: "AI verifies terms and locks funds automatically on blockchain. Smart contract executes with precision.",
      icon: FaLock,
      color: "from-purple-500 to-pink-500",
      animationDelay: 0.2
    },
    {
      id: 3,
      title: "Real-Time Tracking",
      description: "AI monitors conditions and triggers notifications. Global transparency with live updates.",
      icon: FaChartLine,
      color: "from-green-500 to-emerald-500",
      animationDelay: 0.3
    },
    {
      id: 4,
      title: "Release Funds",
      description: "Once AI confirms conditions, funds release automatically on-chain. Instant settlement worldwide.",
      icon: FaRocket,
      color: "from-yellow-500 to-orange-500",
      animationDelay: 0.4
    },
    {
      id: 5,
      title: "Dispute Escalation",
      description: "Human intervention only occurs if a dispute is raised. Full audit trail and transparency.",
      icon: FaExclamationTriangle,
      color: "from-red-500 to-pink-500",
      animationDelay: 0.5
    }
  ];

  const features = [
    {
      title: "AI-Controlled Escrow",
      description: "Autonomous, precise, minimal human intervention with machine learning optimization.",
      icon: FaCog,
      color: "from-blue-600 to-purple-600"
    },
    {
      title: "Blockchain Integration",
      description: "All escrow activity recorded immutably on-chain with full transparency.",
      icon: FaShieldAlt,
      color: "from-green-600 to-blue-600"
    },
    {
      title: "Global Transparency",
      description: "Interactive globe shows flows worldwide with real-time transaction tracking.",
      icon: FaGlobe,
      color: "from-purple-600 to-pink-600"
    },
    {
      title: "Human Arbitration",
      description: "Only for disputes, fully traceable with expert oversight when needed.",
      icon: FaUsers,
      color: "from-red-600 to-orange-600"
    },
    {
      title: "Paymaster Support",
      description: "Optional gas fee sponsorship for seamless user experience.",
      icon: FaRocket,
      color: "from-yellow-600 to-orange-600"
    },
    {
      title: "Role-Based Access",
      description: "User, Broker, and Admin dashboards with appropriate permissions.",
      icon: FaEye,
      color: "from-indigo-600 to-purple-600"
    }
  ];

  const handleCTAClick = (action: string) => {
    switch (action) {
      case 'signup':
        router.push('/signup');
        break;
      case 'login':
        router.push('/login');
        break;
      case 'dashboard':
        router.push('/dashboard');
        break;
      default:
        break;
    }
  };

  return (
    <Layout fullWidth>
      <Head>
        <title>How It Works - Gold Escrow Platform</title>
        <meta name="description" content="Discover how our AI-powered blockchain escrow platform works with global transparency and automated security." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 custom-scrollbar">
        {/* Hero Section with Globe */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/20 z-10" />
          
          {/* Globe Widget */}
          <div className="relative z-20 w-full h-full">
            <GlobeWidget escrows={escrows} userRole={session?.user?.role} />
          </div>

          {/* CTA Overlay */}
          <motion.div 
            className="absolute z-30 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-yellow-400">
              How It Works
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Experience the future of escrow with AI-powered blockchain security and global transparency
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <motion.button
                  onClick={() => handleCTAClick('dashboard')}
                  className="px-8 py-4 bg-gradient-to-r from-gold-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-gold-600 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create Escrow
                </motion.button>
              ) : (
                <>
                  <motion.button
                    onClick={() => handleCTAClick('signup')}
                    className="px-8 py-4 bg-gradient-to-r from-gold-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-gold-600 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign Up
                  </motion.button>
                  <motion.button
                    onClick={() => handleCTAClick('login')}
                    className="px-8 py-4 bg-transparent border-2 border-gold-400 text-gold-400 font-semibold rounded-lg hover:bg-gold-400 hover:text-white transition-all duration-300 transform hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Login
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        </section>

        {/* Step-by-Step Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-800">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                The Escrow Process
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                From creation to completion, our AI ensures every step is secure, transparent, and efficient
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <StepCard 
                  key={step.id}
                  step={step}
                  index={index}
                  totalSteps={steps.length}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-slate-800 to-slate-900">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Key Features
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Advanced technology meets human oversight for the most secure escrow platform
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard 
                  key={index}
                  feature={feature}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Staff/Admin Section */}
        {(session?.user?.role === 'admin' || session?.user?.role === 'staff') && (
          <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-800">
            <div className="max-w-7xl mx-auto">
              <motion.div 
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Admin Dashboard
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Monitor and manage escrows with full visibility and control
                </p>
              </motion.div>

              <AdminDashboardMockup escrows={escrows} />
            </div>
          </section>
        )}

        {/* Footer CTA */}
        <section className="py-20 px-4 bg-gradient-to-b from-slate-800 to-slate-900">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Experience the Future of Escrow
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of users who trust our AI-powered platform for secure, transparent transactions
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {session ? (
                  <motion.button
                    onClick={() => handleCTAClick('dashboard')}
                    className="px-8 py-4 bg-gradient-to-r from-gold-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-gold-600 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Create Your First Escrow
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      onClick={() => handleCTAClick('signup')}
                      className="px-8 py-4 bg-gradient-to-r from-gold-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-gold-600 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Get Started Free
                    </motion.button>
                    <motion.button
                      onClick={() => handleCTAClick('login')}
                      className="px-8 py-4 bg-transparent border-2 border-gold-400 text-gold-400 font-semibold rounded-lg hover:bg-gold-400 hover:text-white transition-all duration-300 transform hover:scale-105"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Sign In
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HowItWorksPage;
