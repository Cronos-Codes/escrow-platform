export interface TrackingEvent {
  eventName: string;
  payload?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

export interface TrackingConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
}

class AnalyticsTracker {
  private config: TrackingConfig;
  private sessionId: string;

  constructor(config: TrackingConfig = { enabled: true }) {
    this.config = config;
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserId(): string | undefined {
    // TODO: Get user ID from auth context or localStorage
    return localStorage.getItem('userId') || undefined;
  }

  private async sendEvent(event: TrackingEvent): Promise<void> {
    if (!this.config.enabled) {
      console.log('Analytics event (disabled):', event);
      return;
    }

    try {
      const enrichedEvent: TrackingEvent = {
        ...event,
        timestamp: event.timestamp || Date.now(),
        userId: event.userId || this.getUserId(),
        sessionId: event.sessionId || this.sessionId,
      };

      // TODO: Send to analytics service (Google Analytics, Mixpanel, etc.)
      if (this.config.endpoint) {
        await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify(enrichedEvent),
        });
      }

      // Log to console for development
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics event:', enrichedEvent);
      }

    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  public trackEvent(eventName: string, payload?: Record<string, any>): void {
    this.sendEvent({ eventName, payload });
  }

  public trackPageView(page: string, title?: string): void {
    this.trackEvent('page_view', { page, title });
  }

  public trackError(error: Error, context?: string): void {
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context,
    });
  }
}

// Auth-specific tracking functions
export const trackAuthEvent = (eventName: string, payload?: Record<string, any>): void => {
  const tracker = new AnalyticsTracker();
  tracker.trackEvent(eventName, payload);
};

// Predefined auth events
export const authEvents = {
  loginAttempt: (method: string, success: boolean, error?: string) => {
    trackAuthEvent('login_attempt', { method, success, error });
  },

  otpSent: (method: 'phone' | 'email', identifier: string) => {
    trackAuthEvent('otp_sent', { method, identifier });
  },

  otpVerified: (method: 'phone' | 'email', success: boolean, error?: string) => {
    trackAuthEvent('otp_verified', { method, success, error });
  },

  signupComplete: (method: string, userId: string) => {
    trackAuthEvent('signup_complete', { method, userId });
  },

  passwordResetRequested: (email: string) => {
    trackAuthEvent('password_reset_requested', { email });
  },

  passwordResetCompleted: (success: boolean, error?: string) => {
    trackAuthEvent('password_reset_completed', { success, error });
  },

  logout: (userId: string, reason?: string) => {
    trackAuthEvent('logout', { userId, reason });
  },

  emailVerificationSent: (email: string) => {
    trackAuthEvent('email_verification_sent', { email });
  },

  emailVerificationCompleted: (success: boolean, error?: string) => {
    trackAuthEvent('email_verification_completed', { success, error });
  },

  profileCompleted: (userId: string, hasKyc: boolean) => {
    trackAuthEvent('profile_completed', { userId, hasKyc });
  },

  oauthLoginAttempt: (provider: string, success: boolean, error?: string) => {
    trackAuthEvent('oauth_login_attempt', { provider, success, error });
  },

  captchaVerified: (success: boolean, error?: string) => {
    trackAuthEvent('captcha_verified', { success, error });
  },

  rateLimitExceeded: (identifier: string, type: string) => {
    trackAuthEvent('rate_limit_exceeded', { identifier, type });
  },

  sessionExpired: (userId: string, reason: string) => {
    trackAuthEvent('session_expired', { userId, reason });
  },

  twoFactorEnabled: (userId: string, method: string) => {
    trackAuthEvent('two_factor_enabled', { userId, method });
  },

  twoFactorDisabled: (userId: string, method: string) => {
    trackAuthEvent('two_factor_disabled', { userId, method });
  },

  deviceTrusted: (userId: string, deviceType: string) => {
    trackAuthEvent('device_trusted', { userId, deviceType });
  },

  deviceRemoved: (userId: string, deviceType: string) => {
    trackAuthEvent('device_removed', { userId, deviceType });
  },
};

// Export the main tracking function
export const trackEvent = (eventName: string, payload?: Record<string, any>): void => {
  trackAuthEvent(eventName, payload);
};

// Export tracker instance for advanced usage
export const analyticsTracker = new AnalyticsTracker(); 