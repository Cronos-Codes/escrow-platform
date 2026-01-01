import React from 'react';
import { Navbar } from './Navbar';
import { ErrorBoundary } from '../ErrorBoundary';

const Footer = () => (
  <footer className="w-full bg-gradient-to-r from-[#1C2A39] to-[#141414] text-gold py-8 px-4 mt-16 border-t border-gold/20">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="text-sm font-medium">© {new Date().getFullYear()} Gold Escrow. All rights reserved.</div>
      <div className="flex gap-4 text-xs">
        <a href="/legal/privacy" className="hover:underline">Privacy Policy</a>
        <a href="/legal/terms" className="hover:underline">Terms of Service</a>
        <a href="/legal/compliance" className="hover:underline">Compliance</a>
      </div>
      <div className="text-xs text-gold/70">Regulated by UAE BAR, AML/KYC, ISO 27001, DIFC</div>
    </div>
  </footer>
);

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const Layout = ({ children, className = '', fullWidth = false }: LayoutProps) => (
  <ErrorBoundary>
    <div className="min-h-screen flex flex-col text-[#1C2A39] snap-container scroll-optimized">
      <Navbar />
      <main className={`flex-1 w-full ${fullWidth ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'} ${className}`}>
        {children}
      </main>
      <Footer />
    </div>
  </ErrorBoundary>
);

export default Layout; 