import React from 'react';
import { useRouter } from 'next/router';

interface HeroSectionProps {
  userRole: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ userRole }) => {
  const router = useRouter();

  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleCreateEscrow = () => {
    router.push('/dashboard');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 z-10">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90" />
      <div className="absolute inset-0 bg-[url('/patterns/hexagon.svg')] opacity-5" />
      
      {/* Animated Globe Orb */}
      <div className="absolute top-20 right-20 w-32 h-32 opacity-30 animate-float">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-gold to-gold-dark border-2 border-gold/50 shadow-gold-glow" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-transparent via-gold/20 to-transparent animate-pulse" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
          <span className="bg-gradient-to-r from-gold via-gold-light to-gold-dark bg-clip-text text-transparent animate-shimmer">
            Discover the Power of
          </span>
          <br />
          <span className="text-gold font-extrabold tracking-wider">
            Gold Escrow
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
          AI-controlled, blockchain-secure, global transactions.
          <br />
          <span className="text-gold/80 font-medium">
            Experience escrow the smart way.
          </span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          {userRole === 'guest' ? (
            <>
              <button
                onClick={handleSignUp}
                className="group relative px-8 py-4 bg-gradient-to-r from-gold to-gold-dark text-black font-bold rounded-lg shadow-gold-glow hover:shadow-gold transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">Sign Up</span>
                <div className="absolute inset-0 bg-gradient-to-r from-gold-light to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
              
              <button
                onClick={handleLogin}
                className="group px-8 py-4 border-2 border-gold text-gold font-bold rounded-lg hover:bg-gold hover:text-black transition-all duration-300 relative overflow-hidden"
              >
                <span className="relative z-10">Login</span>
                <div className="absolute inset-0 bg-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </button>
            </>
          ) : (
            <button
              onClick={handleCreateEscrow}
              className="group relative px-8 py-4 bg-gradient-to-r from-gold to-gold-dark text-black font-bold rounded-lg shadow-gold-glow hover:shadow-gold transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Create Escrow</span>
              <div className="absolute inset-0 bg-gradient-to-r from-gold-light to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          )}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-gentle">
          <div className="w-6 h-10 border-2 border-gold rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gold rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Luxury Accent Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gold/10 to-transparent" />
      <div className="absolute top-1/2 left-10 w-1 h-32 bg-gradient-to-b from-transparent via-gold to-transparent opacity-30" />
      <div className="absolute top-1/2 right-10 w-1 h-32 bg-gradient-to-b from-transparent via-gold to-transparent opacity-30" />
    </section>
  );
};

export default HeroSection;
