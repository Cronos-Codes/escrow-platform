import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { OracleService } from '../src/oracles';

// Mock fetch
global.fetch = jest.fn();

describe('OracleService', () => {
  let oracleService: OracleService;
  const mockRpcUrl = 'https://mainnet.infura.io/v3/test';
  const mockChainlinkUrl = 'https://chainlink-node.example.com';
  const mockAccessKey = 'test-access-key';

  beforeEach(() => {
    oracleService = new OracleService(mockRpcUrl, mockChainlinkUrl, mockAccessKey);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetchFromChainlink', () => {
    it('should successfully fetch data from Chainlink oracle', async () => {
      const mockResponse = {
        success: true,
        data: { price: 50000, timestamp: Date.now() },
        requestId: 'req-123',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await oracleService.fetchFromChainlink('job-123', { symbol: 'BTC' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
      expect(result.requestId).toBe('req-123');
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockChainlinkUrl}/jobs/job-123/runs`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockAccessKey}`,
          }),
          body: JSON.stringify({
            jobId: 'job-123',
            params: { symbol: 'BTC' },
            callback: `${mockChainlinkUrl}/callback`,
          }),
        })
      );
    });

    it('should retry on failure with exponential backoff', async () => {
      const mockError = { ok: false, status: 500, statusText: 'Internal Server Error' };

      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockError)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: { result: 'success' } }),
        });

      const result = await oracleService.fetchFromChainlink('job-123', { test: 'data' });

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
      const mockError = new Error('Persistent error');

      (global.fetch as jest.Mock).mockRejectedValue(mockError);

      await expect(oracleService.fetchFromChainlink('job-123', { test: 'data' }))
        .rejects.toThrow('Oracle request failed after 3 attempts: Persistent error');
    });

    it('should handle oracle response with error', async () => {
      const mockResponse = {
        success: false,
        error: 'Invalid parameters',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await expect(oracleService.fetchFromChainlink('job-123', { invalid: 'params' }))
        .rejects.toThrow('Invalid parameters');
    });

    it('should handle HTTP error responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(oracleService.fetchFromChainlink('job-123', { test: 'data' }))
        .rejects.toThrow('HTTP 404: Not Found');
    });
  });

  describe('subscription management', () => {
    it('should subscribe to oracle events', () => {
      const mockCallback = jest.fn();
      const contractAddress = '0x1234567890123456789012345678901234567890';
      const eventName = 'OracleRequest';

      const subscriptionId = oracleService.subscribeOracleEvents(
        contractAddress,
        eventName,
        mockCallback
      );

      expect(subscriptionId).toBeDefined();
      expect(typeof subscriptionId).toBe('string');
      expect(oracleService.getActiveSubscriptions()).toContain(subscriptionId);
    });

    it('should unsubscribe from oracle events', () => {
      const mockCallback = jest.fn();
      const contractAddress = '0x1234567890123456789012345678901234567890';
      const eventName = 'OracleRequest';

      const subscriptionId = oracleService.subscribeOracleEvents(
        contractAddress,
        eventName,
        mockCallback
      );

      expect(oracleService.getActiveSubscriptions()).toContain(subscriptionId);

      const result = oracleService.unsubscribeOracleEvents(subscriptionId);

      expect(result).toBe(true);
      expect(oracleService.getActiveSubscriptions()).not.toContain(subscriptionId);
    });

    it('should return false when unsubscribing from non-existent subscription', () => {
      const result = oracleService.unsubscribeOracleEvents('non-existent-id');
      expect(result).toBe(false);
    });

    it('should return all active subscriptions', () => {
      const mockCallback = jest.fn();
      const contractAddress = '0x1234567890123456789012345678901234567890';

      const sub1 = oracleService.subscribeOracleEvents(contractAddress, 'Event1', mockCallback);
      const sub2 = oracleService.subscribeOracleEvents(contractAddress, 'Event2', mockCallback);

      const activeSubs = oracleService.getActiveSubscriptions();

      expect(activeSubs).toContain(sub1);
      expect(activeSubs).toContain(sub2);
      expect(activeSubs.length).toBe(2);
    });
  });

  describe('retry configuration', () => {
    it('should update retry configuration', () => {
      const newConfig = {
        maxRetries: 5,
        baseDelay: 2000,
        maxDelay: 15000,
      };

      oracleService.updateRetryConfig(newConfig);

      // Test that the configuration was updated by making a request that will fail
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Test error'));

      return expect(oracleService.fetchFromChainlink('job-123', { test: 'data' }))
        .rejects.toThrow('Oracle request failed after 5 attempts');
    });

    it('should use default retry configuration', () => {
      const defaultConfig = {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
      };

      // Test that the default configuration is used
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Test error'));

      return expect(oracleService.fetchFromChainlink('job-123', { test: 'data' }))
        .rejects.toThrow('Oracle request failed after 3 attempts');
    });
  });

  describe('backoff delay calculation', () => {
    it('should calculate exponential backoff with jitter', () => {
      // Access private method through any type assertion for testing
      const serviceAny = oracleService as any;
      
      const delay1 = serviceAny.calculateBackoffDelay(1);
      const delay2 = serviceAny.calculateBackoffDelay(2);
      const delay3 = serviceAny.calculateBackoffDelay(3);

      // Base delays should be: 1000, 2000, 4000
      expect(delay1).toBeGreaterThanOrEqual(1000);
      expect(delay1).toBeLessThanOrEqual(1100); // 1000 + 10% jitter
      
      expect(delay2).toBeGreaterThanOrEqual(2000);
      expect(delay2).toBeLessThanOrEqual(2200); // 2000 + 10% jitter
      
      expect(delay3).toBeGreaterThanOrEqual(4000);
      expect(delay3).toBeLessThanOrEqual(4400); // 4000 + 10% jitter
    });

    it('should cap delay at maximum value', () => {
      const serviceAny = oracleService as any;
      
      // Test with a very high attempt number
      const delay = serviceAny.calculateBackoffDelay(10);
      
      expect(delay).toBeLessThanOrEqual(10000); // maxDelay
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network timeout'));

      await expect(oracleService.fetchFromChainlink('job-123', { test: 'data' }))
        .rejects.toThrow('Oracle request failed after 3 attempts: Network timeout');
    });

    it('should handle malformed JSON responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(oracleService.fetchFromChainlink('job-123', { test: 'data' }))
        .rejects.toThrow('Oracle request failed after 3 attempts: Invalid JSON');
    });
  });
}); 