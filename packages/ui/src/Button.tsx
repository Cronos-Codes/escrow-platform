import React from 'react';
import { GoldButton } from './placeholder';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  className,
  type = 'button',
  fullWidth = false,
  icon,
  iconPosition = 'left',
}) => {
  const renderContent = () => {
    if (loading) {
      return 'Loading...';
    }

    if (icon) {
      return (
        <div className="flex items-center justify-center space-x-2">
          {iconPosition === 'left' && icon}
          <span>{children}</span>
          {iconPosition === 'right' && icon}
        </div>
      );
    }

    return children;
  };

  return (
    <GoldButton
      variant={variant}
      size={size}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      className={className}
      type={type}
      fullWidth={fullWidth}
    >
      {renderContent()}
    </GoldButton>
  );
}; 