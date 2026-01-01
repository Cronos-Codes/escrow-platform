import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

export interface AuthMetric {
  method: 'phone' | 'email' | 'wallet';
  status: 'success' | 'failure';
  reason?: string;
  responseTime: number;
  timestamp: number;
}

export interface RateLimitMetric {
  action: string;
  identifier: string; // Hashed/masked
  exceeded: boolean;
  timestamp: number;
}

export class AuthMonitor {
  private db: FirebaseFirestore.Firestore;
  private metricsCollection: string;
  private alertsCollection: string;

  constructor() {
    this.db = getFirestore();
    this.metricsCollection = 'authMetrics';
    this.alertsCollection = 'authAlerts';
  }

  async recordAuthAttempt(metric: AuthMetric): Promise<void> {
    try {
      await this.db.collection(this.metricsCollection).add({
        ...metric,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Check for suspicious activity
      await this.checkForSuspiciousActivity(metric);
    } catch (error) {
      console.error('Failed to record auth metric:', error);
    }
  }

  async recordRateLimit(metric: RateLimitMetric): Promise<void> {
    try {
      await this.db.collection(this.metricsCollection).add({
        type: 'rateLimit',
        ...metric,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      if (metric.exceeded) {
        await this.createAlert('RATE_LIMIT_EXCEEDED', {
          action: metric.action,
          message: 'Rate limit exceeded multiple times',
          severity: 'warning',
        });
      }
    } catch (error) {
      console.error('Failed to record rate limit metric:', error);
    }
  }

  private async checkForSuspiciousActivity(metric: AuthMetric): Promise<void> {
    const timeWindow = 3600000; // 1 hour
    const failureThreshold = 10;

    try {
      // Count failures in the last hour
      const startTime = Date.now() - timeWindow;
      const failureCount = await this.db
        .collection(this.metricsCollection)
        .where('method', '==', metric.method)
        .where('status', '==', 'failure')
        .where('timestamp', '>=', startTime)
        .count()
        .get();

      if (failureCount.data().count >= failureThreshold) {
        await this.createAlert('SUSPICIOUS_ACTIVITY', {
          method: metric.method,
          message: `High failure rate detected for ${metric.method} authentication`,
          failureCount: failureCount.data().count,
          timeWindow,
          severity: 'high',
        });
      }
    } catch (error) {
      console.error('Failed to check for suspicious activity:', error);
    }
  }

  private async createAlert(
    type: string,
    data: Record<string, any>
  ): Promise<void> {
    try {
      await this.db.collection(this.alertsCollection).add({
        type,
        ...data,
        timestamp: Date.now(),
        status: 'new',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  }

  async getAuthMetrics(timeWindow: number = 3600000): Promise<{
    totalAttempts: number;
    successRate: number;
    averageResponseTime: number;
    methodBreakdown: Record<string, number>;
  }> {
    try {
      const startTime = Date.now() - timeWindow;
      const snapshot = await this.db
        .collection(this.metricsCollection)
        .where('timestamp', '>=', startTime)
        .get();

      const metrics = snapshot.docs.map(doc => doc.data() as AuthMetric);

      const totalAttempts = metrics.length;
      const successfulAttempts = metrics.filter(m => m.status === 'success').length;
      const totalResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0);

      const methodBreakdown = metrics.reduce((acc, m) => {
        acc[m.method] = (acc[m.method] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalAttempts,
        successRate: totalAttempts ? (successfulAttempts / totalAttempts) : 0,
        averageResponseTime: totalAttempts ? (totalResponseTime / totalAttempts) : 0,
        methodBreakdown,
      };
    } catch (error) {
      console.error('Failed to get auth metrics:', error);
      throw error;
    }
  }

  async getActiveAlerts(): Promise<Array<{
    type: string;
    severity: string;
    message: string;
    timestamp: number;
  }>> {
    try {
      const snapshot = await this.db
        .collection(this.alertsCollection)
        .where('status', '==', 'new')
        .orderBy('timestamp', 'desc')
        .limit(100)
        .get();

      return snapshot.docs.map(doc => doc.data() as any);
    } catch (error) {
      console.error('Failed to get active alerts:', error);
      throw error;
    }
  }
}

// Singleton instance
export const authMonitor = new AuthMonitor();
