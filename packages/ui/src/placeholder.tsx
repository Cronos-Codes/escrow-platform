import React from 'react';

// Placeholder components to resolve import issues
export const BackgroundScene: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`min-h-screen bg-gradient-to-br from-black to-gray-900 ${className || ''}`}>
    {children}
  </div>
);

export const GoldCard: React.FC<{ children: React.ReactNode; variant?: string; className?: string }> = ({ children, className }) => (
  <div className={`bg-white/10 backdrop-blur-md border border-gold/20 rounded-xl p-6 ${className || ''}`}>
    {children}
  </div>
);

export const GoldButton: React.FC<{ 
  children: React.ReactNode; 
  variant?: string; 
  size?: string; 
  loading?: boolean; 
  onClick?: () => void;
  className?: string;
  type?: string;
}> = ({ children, onClick, className }) => (
  <button 
    onClick={onClick}
    className={`bg-gold text-black px-6 py-3 rounded-lg font-medium hover:bg-gold-dark transition-colors ${className || ''}`}
  >
    {children}
  </button>
);

export const GoldInput: React.FC<{ 
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
}> = ({ label, type = 'text', placeholder, value, onChange, error, className }) => (
  <div className={`w-full ${className || ''}`}>
    {label && <label className="block text-sm font-medium text-gold mb-2">{label}</label>}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full px-4 py-3 bg-transparent border-2 border-gold/30 rounded-lg text-white placeholder-gray-400 focus:border-gold focus:outline-none"
    />
    {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
  </div>
);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="dark">
    {children}
  </div>
);

export const DashboardShell: React.FC<{ 
  children: React.ReactNode; 
  sidebarContent?: React.ReactNode; 
  headerContent?: React.ReactNode; 
  className?: string;
}> = ({ children, sidebarContent, headerContent, className }) => (
  <div className={`flex h-screen ${className || ''}`}>
    {sidebarContent && (
      <aside className="w-80 bg-black/80 border-r border-gold/20 p-6">
        {sidebarContent}
      </aside>
    )}
    <div className="flex-1 flex flex-col">
      {headerContent && (
        <header className="h-16 bg-black/60 border-b border-gold/20 px-6 flex items-center justify-between">
          {headerContent}
        </header>
      )}
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  </div>
); 