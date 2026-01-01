import React from 'react';
import { useRouter } from 'next/router';

interface FooterCTAProps {
  userRole: string;
}

const FooterCTA: React.FC<FooterCTAProps> = ({ userRole }) => {
  const router = useRouter();

  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleCreateEscrow = () => {
    router.push('/dashboard');
  };

  const handleContact = () => {
    router.push('/contact');
  };

  return (
    <section className="relative py-20 px-4 z-10">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      
      {/* Content */}
      <div className="relative max-w-4xl mx-auto text-center">
        {/* Main CTA */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
              Ready to Experience
            </span>
            <br />
            <span className="text-gold">Gold Escrow?</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Join thousands of users who trust our platform for secure, 
            <br />
            <span className="text-gold/80 font-medium">
              AI-powered escrow services worldwide.
            </span>
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          {userRole === 'guest' ? (
            <>
              <button
                onClick={handleSignUp}
                className="group relative px-10 py-4 bg-gradient-to-r from-gold to-gold-dark text-black font-bold rounded-lg shadow-gold-glow hover:shadow-gold transform hover:scale-105 transition-all duration-300 overflow-hidden min-w-[200px]"
              >
                <span className="relative z-10">Sign Up Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-gold-light to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
              
              <button
                onClick={handleLogin}
                className="group px-10 py-4 border-2 border-gold text-gold font-bold rounded-lg hover:bg-gold hover:text-black transition-all duration-300 relative overflow-hidden min-w-[200px]"
              >
                <span className="relative z-10">Login</span>
                <div className="absolute inset-0 bg-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCreateEscrow}
                className="group relative px-10 py-4 bg-gradient-to-r from-gold to-gold-dark text-black font-bold rounded-lg shadow-gold-glow hover:shadow-gold transform hover:scale-105 transition-all duration-300 overflow-hidden min-w-[200px]"
              >
                <span className="relative z-10">Create Escrow</span>
                <div className="absolute inset-0 bg-gradient-to-r from-gold-light to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
              
              <button
                onClick={handleContact}
                className="group px-10 py-4 border-2 border-gold text-gold font-bold rounded-lg hover:bg-gold hover:text-black transition-all duration-300 relative overflow-hidden min-w-[200px]"
              >
                <span className="relative z-10">Contact Support</span>
                <div className="absolute inset-0 bg-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </button>
            </>
          )}
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-gold mb-2">24/7</div>
            <div className="text-gray-300">Support Available</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gold mb-2">99.9%</div>
            <div className="text-gray-300">Uptime Guarantee</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gold mb-2">Global</div>
            <div className="text-gray-300">Coverage</div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="border-t border-gold/20 pt-8">
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Regulated by UAE BAR</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>AML/KYC Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>ISO 27001 Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>DIFC Licensed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 border border-gold/10 rounded-full opacity-30 animate-pulse" />
      <div className="absolute bottom-20 right-20 w-24 h-24 border border-gold/10 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-10 w-1 h-32 bg-gradient-to-b from-transparent via-gold/20 to-transparent" />
      <div className="absolute top-1/2 right-10 w-1 h-32 bg-gradient-to-b from-transparent via-gold/20 to-transparent" />

      {/* Particle Trail Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-1 h-1 bg-gold rounded-full animate-float" style={{ animationDelay: '0s', animationDuration: '4s' }} />
        <div className="absolute top-0 left-1/2 w-1 h-1 bg-gold rounded-full animate-float" style={{ animationDelay: '1s', animationDuration: '5s' }} />
        <div className="absolute top-0 left-3/4 w-1 h-1 bg-gold rounded-full animate-float" style={{ animationDelay: '2s', animationDuration: '4.5s' }} />
      </div>
    </section>
  );
};

export default FooterCTA;
