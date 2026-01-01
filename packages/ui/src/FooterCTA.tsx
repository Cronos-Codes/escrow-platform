import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface FooterCTAProps {
  text: string;
  linkText: string;
  linkHref: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}

export const FooterCTA: React.FC<FooterCTAProps> = ({
  text,
  linkText,
  linkHref,
  className,
  onClick,
}) => {
  return (
    <motion.div
      className={`text-center ${className || ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <p className="text-white/70 text-sm">
        {text}{' '}
        <Link
          href={linkHref}
          className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors duration-200 underline-offset-2 hover:underline"
          onClick={onClick}
        >
          {linkText}
        </Link>
      </p>
    </motion.div>
  );
}; 