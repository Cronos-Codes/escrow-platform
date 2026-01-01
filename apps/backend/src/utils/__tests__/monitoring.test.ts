import { AuthMonitor, AuthMetric, RateLimitMetric } from '../monitoring';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(),
}));

jest.mock('firebase-admin', () => ({
  firestore: {
    FieldValue: {
      serverTimestamp: jest.fn(),
    },
  },
}));

describe('AuthMonitor', () => {
  let authMonitor: AuthMonitor;
  let mockFirestore: any;
  let mockCollection: any;
  let mockAdd: jest.Mock;
  let mockWhere: jest.Mock;
  let mockCount: jest.Mock;
  let mockGet: jest.Mock;
  let mockOrderBy: jest.Mock;
  let mockLimit: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGet = jest.fn();
    mockCount = jest.fn().mockReturnValue({ get: mockGet });
    mockWhere = jest.fn().mockReturnValue({ 
      where: mockWhere,
      count: mockCount,
      get: mockGet,
      orderBy: mockOrderBy,
    });
    mockOrderBy = jest.fn().mockReturnValue({
      limit: mockLimit,
    });
    mockLimit = jest.fn().mockReturnValue({
      get: mockGet,
    });
    mockAdd = jest.fn().mockResolvedValue({ id: 'test-doc-id' });
    mockCollection = jest.fn().mockReturnValue({
      add: mockAdd,
      where: mockWhere,
    });
    mockFirestore = {
      collection: mockCollection,
    };

    (getFirestore as jest.Mock).mockReturnValue(mockFirestore);
    (admin.firestore.FieldValue.serverTimestamp as jest.Mock).mockReturnValue('server-timestamp');

    authMonitor = new AuthMonitor();
  });

  describe('recordAuthAttempt', () => {
    const testMetric: AuthMetric = {
      method: 'phone',
      status: 'success',
      responseTime: 100,
      timestamp: Date.now(),
    };

    it('should record auth metrics correctly', async () => {
      await authMonitor.recordAuthAttempt(testMetric);

      expect(mockFirestore.collection).toHaveBeenCalledWith('authMetrics');
      expect(mockAdd).toHaveBeenCalledWith({
        ...testMetric,
        createdAt: 'server-timestamp',
      });
    });

    it('should handle recording errors gracefully', async () => {
      mockAdd.mockRejectedValue(new Error('Recording failed'));
      
      await expect(authMonitor.recordAuthAttempt(testMetric))
        .resolves.toBeUndefined();
    });
  });

  describe('recordRateLimit', () => {
    const testMetric: RateLimitMetric = {
      action: 'phoneOtp',
      identifier: 'test-id',
      exceeded: true,
      timestamp: Date.now(),
    };

    it('should record rate limit metrics correctly', async () => {
      await authMonitor.recordRateLimit(testMetric);

      expect(mockFirestore.collection).toHaveBeenCalledWith('authMetrics');
      expect(mockAdd).toHaveBeenCalledWith({
        type: 'rateLimit',
        ...testMetric,
        createdAt: 'server-timestamp',
      });
    });

    it('should create alert when rate limit is exceeded', async () => {
      await authMonitor.recordRateLimit(testMetric);

      expect(mockFirestore.collection).toHaveBeenCalledWith('authAlerts');
      expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({
        type: 'RATE_LIMIT_EXCEEDED',
        severity: 'warning',
      }));
    });
  });

  describe('getAuthMetrics', () => {
    it('should calculate metrics correctly', async () => {
      const mockDocs = [
        { data: () => ({ method: 'phone', status: 'success', responseTime: 100 }) },
        { data: () => ({ method: 'email', status: 'failure', responseTime: 200 }) },
        { data: () => ({ method: 'phone', status: 'success', responseTime: 150 }) },
      ];
      mockGet.mockResolvedValue({ docs: mockDocs });

      const metrics = await authMonitor.getAuthMetrics();

      expect(metrics).toEqual({
        totalAttempts: 3,
        successRate: 2/3,
        averageResponseTime: 150,
        methodBreakdown: {
          phone: 2,
          email: 1,
        },
      });
    });

    it('should handle empty results', async () => {
      mockGet.mockResolvedValue({ docs: [] });

      const metrics = await authMonitor.getAuthMetrics();

      expect(metrics).toEqual({
        totalAttempts: 0,
        successRate: 0,
        averageResponseTime: 0,
        methodBreakdown: {},
      });
    });
  });

  describe('getActiveAlerts', () => {
    it('should return active alerts', async () => {
      const mockAlerts = [
        { 
          data: () => ({
            type: 'SUSPICIOUS_ACTIVITY',
            severity: 'high',
            message: 'Test alert',
            timestamp: Date.now(),
          }),
        },
      ];
      mockGet.mockResolvedValue({ docs: mockAlerts });

      const alerts = await authMonitor.getActiveAlerts();

      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toMatchObject({
        type: 'SUSPICIOUS_ACTIVITY',
        severity: 'high',
      });
    });

    it('should handle errors gracefully', async () => {
      mockGet.mockRejectedValue(new Error('Query failed'));

      await expect(authMonitor.getActiveAlerts()).rejects.toThrow('Query failed');
    });
  });
});
