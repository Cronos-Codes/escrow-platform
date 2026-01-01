'use client';

import { useState, useEffect } from 'react';
import { Topbar } from './Topbar';
import { LeftNav } from './LeftNav';
import { RightDrawer } from './RightDrawer';
import { Footer } from './Footer';
import { Chatbot } from './Chatbot';
import { BottomNavigation } from './BottomNavigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isLeftNavOpen, setIsLeftNavOpen] = useState(true);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Responsive breakpoint detection
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      
      // Auto-collapse sidebar on mobile
      if (width < 768) {
        setIsLeftNavOpen(false);
      } else if (width >= 1024) {
        setIsLeftNavOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleMenuToggle = () => {
    setIsLeftNavOpen(!isLeftNavOpen);
  };

  const handleRightDrawerToggle = () => {
    setIsRightDrawerOpen(!isRightDrawerOpen);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Topbar - Always visible */}
      <Topbar 
        onMenuToggle={handleMenuToggle}
        onRightDrawerToggle={handleRightDrawerToggle}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      <div className="flex h-[calc(100vh-64px)] relative">
        {/* Left Navigation - Hidden on mobile, overlay on tablet */}
        <LeftNav 
          isOpen={isLeftNavOpen} 
          isMobile={isMobile}
          isTablet={isTablet}
          onClose={() => setIsLeftNavOpen(false)}
        />

        {/* Main Content Area */}
        <main className={`
          flex-1 overflow-auto admin-scrollbar transition-all duration-300 ease-in-out
          ${isMobile ? 'ml-0' : isTablet ? (isLeftNavOpen ? 'ml-64' : 'ml-0') : (isLeftNavOpen ? 'ml-64' : 'ml-16')}
          ${isMobile && isLeftNavOpen ? 'blur-sm pointer-events-none' : ''}
        `}>
          <div className={`
            ${isMobile ? 'p-3 pb-20' : isTablet ? 'p-4' : 'p-6'}
            min-h-full
          `}>
            {children}
          </div>
          
          {/* Footer - Hidden on mobile */}
          {!isMobile && <Footer />}
        </main>

        {/* Right Utility Drawer */}
        <RightDrawer 
          isOpen={isRightDrawerOpen}
          onClose={() => setIsRightDrawerOpen(false)}
          isMobile={isMobile}
        />
      </div>

      {/* Bottom Navigation - Mobile only */}
      {isMobile && (
        <BottomNavigation />
      )}

      {/* Floating Chatbot - Hidden on mobile */}
      {!isMobile && <Chatbot />}

      {/* Mobile overlay for sidebar */}
      {isMobile && isLeftNavOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsLeftNavOpen(false)}
        />
      )}
    </div>
  );
}
