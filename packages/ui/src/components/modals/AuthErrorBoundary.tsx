/**
 * @file Auth Error Boundary
 * @description Error boundary for auth flows to provide graceful degradation
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo);
    // In production, you might want to log this to an error reporting service
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 bg-red-50 border border-red-200 rounded-lg"
        >
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Authentication Error
          </h3>
          <p className="text-sm text-red-600 mb-4">
            {this.state.error?.message || 'An unexpected error occurred during authentication.'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}


