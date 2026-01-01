import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './theme';

// Enhanced GoldCard with glassmorphism
export const GoldCard: React.FC<{ 
  children: React.ReactNode; 
  variant?: 'elevated' | 'glass' | 'solid';
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ children, variant = 'glass', className, padding = 'lg' }) => {
  const theme = useTheme();
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  };

  const variantClasses = {
    elevated: 'bg-white/90 backdrop-blur-md border border-white/60 shadow-2xl',
    glass: 'bg-white/25 backdrop-blur-md border border-white/60 shadow-glass',
    solid: 'bg-white/95 backdrop-blur-sm border border-white/80 shadow-lg',
  };

  return (
    <motion.div
      className={`
        rounded-2xl ${variantClasses[variant]} ${paddingClasses[padding]} ${className || ''}
        transition-all duration-300 ease-out
        hover:shadow-2xl hover:scale-[1.02]
      `}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
    {children}
    </motion.div>
);
};

// Enhanced GoldButton with multiple variants and states
export const GoldButton: React.FC<{ 
  children: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean; 
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  disabled = false,
  onClick, 
  className,
  type = 'button',
  fullWidth = false,
}) => {
  const theme = useTheme();
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold hover:from-yellow-600 hover:to-yellow-700 shadow-lg hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-yellow-500 text-yellow-500 bg-transparent hover:bg-yellow-500 hover:text-black',
    ghost: 'text-yellow-500 bg-transparent hover:bg-yellow-500/10',
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
    onClick={onClick}
      disabled={isDisabled}
      className={`
        ${sizeClasses[size]} ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} 
        rounded-xl font-medium transition-all duration-300 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        focus:outline-none focus:ring-4 focus:ring-yellow-500/30
        ${className || ''}
      `}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
  >
      {loading ? (
        <div className="flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
          />
          Loading...
        </div>
      ) : (
        children
      )}
    </motion.button>
);
};

// Enhanced GoldInput with validation states and animations
export const GoldInput: React.FC<{ 
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  success?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  onBlur?: () => void;
  onFocus?: () => void;
  autoComplete?: string;
  name?: string;
  id?: string;
}> = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error,
  success = false,
  className,
  disabled = false,
  icon,
  onBlur,
  onFocus,
  autoComplete,
  name,
  id,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const theme = useTheme();

  const getBorderColor = () => {
    if (error) return 'border-red-500';
    if (success) return 'border-green-500';
    if (isFocused) return 'border-yellow-500';
    return 'border-white/30';
  };

  return (
    <motion.div 
      className={`w-full ${className || ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {label && (
        <label className="block text-sm font-medium text-white/90 mb-2">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">
            {icon}
          </div>
        )}
        
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.();
          }}
          disabled={disabled}
          autoComplete={autoComplete}
          name={name}
          id={id}
          className={`
            w-full px-4 py-3 bg-white/10 backdrop-blur-sm 
            border-2 ${getBorderColor()} rounded-xl
            text-white placeholder-white/50 
            focus:outline-none focus:ring-4 focus:ring-yellow-500/20
            transition-all duration-300 ease-out
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : ''}
          `}
          {...props}
        />
        
        {/* Success/Error indicators */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
  </div>
      
      {error && (
        <motion.p 
          className="mt-2 text-sm text-red-400"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

// Enhanced ThemeProvider with CSS variable application
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    // Apply theme CSS variables
    const root = document.documentElement;
    Object.entries({
      '--color-primary-gold': '#D4AF37',
      '--color-secondary': '#1A73E8',
      '--color-bg': '#F5F7FA',
      '--color-surface': '#FFFFFF',
      '--color-text': '#202124',
      '--glass-bg': 'rgba(255, 255, 255, 0.25)',
      '--glass-blur': '16px',
      '--glass-border': 'rgba(255, 255, 255, 0.6)',
    }).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }, []);

  return (
    <div className="font-sans antialiased">
    {children}
  </div>
);
};

// Enhanced DashboardShell with responsive design
export const DashboardShell: React.FC<{ 
  children: React.ReactNode; 
  sidebarContent?: React.ReactNode; 
  headerContent?: React.ReactNode; 
  className?: string;
  sidebarCollapsed?: boolean;
}> = ({ 
  children, 
  sidebarContent, 
  headerContent, 
  className,
  sidebarCollapsed = false,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(!sidebarCollapsed);

  return (
    <div className={`flex h-screen bg-gradient-to-br from-gray-900 to-black ${className || ''}`}>
      {/* Sidebar */}
    {sidebarContent && (
        <motion.aside
          className={`
            bg-black/80 backdrop-blur-md border-r border-white/10
            ${isSidebarOpen ? 'w-80' : 'w-20'}
            transition-all duration-300 ease-out
          `}
          initial={{ x: -320 }}
          animate={{ x: 0 }}
        >
          <div className="p-6">
        {sidebarContent}
          </div>
        </motion.aside>
    )}
      
      {/* Main content */}
    <div className="flex-1 flex flex-col">
        {/* Header */}
      {headerContent && (
          <motion.header 
            className="h-16 bg-black/60 backdrop-blur-md border-b border-white/10 px-6 flex items-center justify-between"
            initial={{ y: -64 }}
            animate={{ y: 0 }}
          >
          {headerContent}
          </motion.header>
      )}
        
        {/* Main content area */}
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  </div>
); 
}; 