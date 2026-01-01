import { RateLimiter, rateLimitConfigs } from '../rateLimiter';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(),
}));

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  let mockFirestore: any;
  let mockCollection: any;
  let mockDoc: any;
  let mockTransaction: any;

  beforeEach(() => {
    mockDoc = {
      get: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    mockCollection = {
      doc: jest.fn().mockReturnValue(mockDoc),
    };

    mockFirestore = {
      collection: jest.fn().mockReturnValue(mockCollection),
      runTransaction: jest.fn(),
    };

    (getFirestore as jest.Mock).mockReturnValue(mockFirestore);

    rateLimiter = new RateLimiter();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isRateLimited', () => {
    const testConfig = {
      maxAttempts: 5,
      windowMs: 3600000,
    };

    it('should return false for first attempt', async () => {
      const mockDocData = {
        exists: false,
        data: () => null,
      };

      mockDoc.get.mockResolvedValue(mockDocData);
      mockFirestore.runTransaction.mockImplementation((callback) => callback(mockTransaction));

      const result = await rateLimiter.isRateLimited('test-id', 'test-action', testConfig);

      expect(result).toBe(false);
      expect(mockFirestore.collection).toHaveBeenCalledWith('rateLimits');
      expect(mockCollection.doc).toHaveBeenCalledWith('test-action_test-id');
    });

    it('should return true when attempts exceed limit', async () => {
      const now = Date.now();
      const mockDocData = {
        exists: true,
        data: () => ({
          attempts: 6,
          firstAttempt: now,
          lastAttempt: now,
        }),
      };

      mockDoc.get.mockResolvedValue(mockDocData);
      mockFirestore.runTransaction.mockImplementation((callback) => callback(mockTransaction));

      const result = await rateLimiter.isRateLimited('test-id', 'test-action', testConfig);

      expect(result).toBe(true);
    });

    it('should reset counter when outside window', async () => {
      const now = Date.now();
      const mockDocData = {
        exists: true,
        data: () => ({
          attempts: 6,
          firstAttempt: now - testConfig.windowMs - 1000, // Outside window
          lastAttempt: now - testConfig.windowMs - 1000,
        }),
      };

      mockDoc.get.mockResolvedValue(mockDocData);
      mockFirestore.runTransaction.mockImplementation((callback) => callback(mockTransaction));

      const result = await rateLimiter.isRateLimited('test-id', 'test-action', testConfig);

      expect(result).toBe(false);
    });

    it('should increment attempts within window', async () => {
      const now = Date.now();
      const mockDocData = {
        exists: true,
        data: () => ({
          attempts: 3,
          firstAttempt: now - 1000, // Within window
          lastAttempt: now - 1000,
        }),
      };

      mockTransaction = {
        get: jest.fn().mockResolvedValue(mockDocData),
        update: jest.fn(),
      };

      mockDoc.get.mockResolvedValue(mockDocData);
      mockFirestore.runTransaction.mockImplementation((callback) => callback(mockTransaction));

      const result = await rateLimiter.isRateLimited('test-id', 'test-action', testConfig);

      expect(result).toBe(false);
      expect(mockTransaction.update).toHaveBeenCalled();
    });

    it('should handle transaction errors gracefully', async () => {
      mockFirestore.runTransaction.mockRejectedValue(new Error('Transaction failed'));

      const result = await rateLimiter.isRateLimited('test-id', 'test-action', testConfig);

      expect(result).toBe(false); // Should fail open
    });
  });

  describe('clearRateLimit', () => {
    it('should delete the rate limit document', async () => {
      await rateLimiter.clearRateLimit('test-id', 'test-action');

      expect(mockFirestore.collection).toHaveBeenCalledWith('rateLimits');
      expect(mockCollection.doc).toHaveBeenCalledWith('test-action_test-id');
      expect(mockDoc.delete).toHaveBeenCalled();
    });

    it('should handle deletion errors gracefully', async () => {
      mockDoc.delete.mockRejectedValue(new Error('Deletion failed'));

      await expect(rateLimiter.clearRateLimit('test-id', 'test-action'))
        .rejects.toThrow('Deletion failed');
    });
  });

  describe('rateLimitConfigs', () => {
    it('should have correct configurations', () => {
      expect(rateLimitConfigs).toEqual({
        phoneOtp: {
          maxAttempts: 5,
          windowMs: 3600000,
        },
        emailOtp: {
          maxAttempts: 5,
          windowMs: 3600000,
        },
        walletLogin: {
          maxAttempts: 10,
          windowMs: 3600000,
        },
      });
    });
  });
});
