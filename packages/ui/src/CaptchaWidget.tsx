import React, { useEffect, useRef } from 'react';

interface CaptchaWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError: (error: string) => void;
  action?: string;
  className?: string;
}

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export const CaptchaWidget: React.FC<CaptchaWidgetProps> = ({
  siteKey,
  onVerify,
  onError,
  action = 'submit',
  className = '',
}) => {
  const isLoaded = useRef(false);

  useEffect(() => {
    // Load reCAPTCHA script if not already loaded
    if (!window.grecaptcha && !isLoaded.current) {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        isLoaded.current = true;
      };
      
      script.onerror = () => {
        onError('Failed to load reCAPTCHA');
      };
      
      document.head.appendChild(script);
    }
  }, [siteKey, onError]);

  const executeCaptcha = async (): Promise<string | null> => {
    if (!window.grecaptcha) {
      onError('reCAPTCHA not loaded');
      return null;
    }

    try {
      return new Promise((resolve, reject) => {
        window.grecaptcha.ready(async () => {
          try {
            const token = await window.grecaptcha.execute(siteKey, { action });
            resolve(token);
          } catch (error) {
            reject(error);
          }
        });
      });
    } catch (error) {
      onError(error instanceof Error ? error.message : 'reCAPTCHA execution failed');
      return null;
    }
  };

  const handleVerify = async () => {
    const token = await executeCaptcha();
    if (token) {
      onVerify(token);
    }
  };

  return (
    <div className={`captcha-widget ${className}`}>
      <button
        type="button"
        onClick={handleVerify}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Verify reCAPTCHA"
      >
        Verify I'm Human
      </button>
      <p className="text-xs text-gray-500 mt-2 text-center">
        This site is protected by reCAPTCHA and the Google{' '}
        <a href="https://policies.google.com/privacy" className="text-blue-600 hover:underline">
          Privacy Policy
        </a>{' '}
        and{' '}
        <a href="https://policies.google.com/terms" className="text-blue-600 hover:underline">
          Terms of Service
        </a>{' '}
        apply.
      </p>
    </div>
  );
}; 