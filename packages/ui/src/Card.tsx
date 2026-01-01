import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div
    className={`bg-white rounded-xl shadow border border-gray-200 p-4 ${className}`.trim()}
    {...props}
  >
    {children}
  </div>
); 