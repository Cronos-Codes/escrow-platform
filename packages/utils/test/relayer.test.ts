import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PaymentRelayer, createUserOperation, validateUserOperation, UserOperation } from '../relayer';

// Mock fetch globally
global.fetch = vi.fn();

describe('PaymentRelayer', () => {
  let relayer: PaymentRelayer;
  let mockFetch: any;

  beforeEach(() => {
    relayer = new PaymentRelayer({
      bundlerUrl: 'https://test-bundler.com',
      entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
      maxRetries: 2,
      retryDelay: 100,
      timeout: 5000
    });
    mockFetch = fetch as any;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('relayUserOp', () => {
    const mockUserOp: UserOperation = {
      sender: '0x1234567890123456789012345678901234567890',
      nonce: '0x0',
      initCode: '0x',
      callData: '0x',
      callGasLimit: '0x186A0',
      verificationGasLimit: '0xC350',
      preVerificationGas: '0x5208',
      maxFeePerGas: '0x59682F00',
      maxPriorityFeePerGas: '0x59682F00',
      paymasterAndData: '0x',
      signature: '0x'
    };

    it('should successfully relay user operation', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: expect.any(Number),
        result: '0xuserophash123'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Mock provider waitForTransaction
      const mockProvider = {
        waitForTransaction: vi.fn().mockResolvedValue({
          hash: '0xtxhash123',
          blockNumber: 12345,
          blockHash: '0xblockhash123',
          gasUsed: '21000',
          effectiveGasPrice: '1500000000',
          status: 1,
          logs: []
        })
      };

      relayer = new PaymentRelayer({}, mockProvider as any);

      const result = await relayer.relayUserOp(mockUserOp);

      expect(result).toEqual({
        transactionHash: '0xtxhash123',
        blockNumber: 12345,
        blockHash: '0xblockhash123',
        gasUsed: '21000',
        effectiveGasPrice: '1500000000',
        status: 1,
        logs: []
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-bundler.com',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('eth_sendUserOperation')
        })
      );
    });

    it('should retry on failure with exponential backoff', async () => {
      const mockError = new Error('Bundler error');
      mockFetch.mockRejectedValue(mockError);

      // Mock provider for fallback
      const mockProvider = {
        waitForTransaction: vi.fn().mockResolvedValue({
          hash: '0xfallbacktxhash',
          blockNumber: 12345,
          blockHash: '0xblockhash123',
          gasUsed: '21000',
          effectiveGasPrice: '1500000000',
          status: 1,
          logs: []
        })
      };

      relayer = new PaymentRelayer({}, mockProvider as any);

      const result = await relayer.relayUserOp(mockUserOp);

      expect(result.transactionHash).toBe('0xfallbacktxhash');
      expect(mockFetch).toHaveBeenCalledTimes(3); // 2 retries + 1 initial
    });

    it('should throw error after max retries', async () => {
      const mockError = new Error('Bundler error');
      mockFetch.mockRejectedValue(mockError);

      // Mock provider that also fails
      const mockProvider = {
        waitForTransaction: vi.fn().mockRejectedValue(new Error('Provider error'))
      };

      relayer = new PaymentRelayer({}, mockProvider as any);

      await expect(relayer.relayUserOp(mockUserOp)).rejects.toThrow(
        'Failed to relay user operation after 2 attempts'
      );
    });

    it('should use fallback bundler when primary fails', async () => {
      relayer = new PaymentRelayer({
        bundlerUrl: 'https://primary-bundler.com',
        fallbackBundlerUrl: 'https://fallback-bundler.com'
      });

      // Primary bundler fails
      mockFetch.mockRejectedValueOnce(new Error('Primary bundler down'));

      // Fallback bundler succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: expect.any(Number),
          result: '0xuserophash123'
        })
      });

      // Mock provider
      const mockProvider = {
        waitForTransaction: vi.fn().mockResolvedValue({
          hash: '0xfallbacktxhash',
          blockNumber: 12345,
          blockHash: '0xblockhash123',
          gasUsed: '21000',
          effectiveGasPrice: '1500000000',
          status: 1,
          logs: []
        })
      };

      relayer = new PaymentRelayer({}, mockProvider as any);

      const result = await relayer.relayUserOp(mockUserOp);

      expect(result.transactionHash).toBe('0xfallbacktxhash');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle timeout errors', async () => {
      mockFetch.mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 100);
        });
      });

      // Mock provider for fallback
      const mockProvider = {
        waitForTransaction: vi.fn().mockResolvedValue({
          hash: '0xtimeoutfallback',
          blockNumber: 12345,
          blockHash: '0xblockhash123',
          gasUsed: '21000',
          effectiveGasPrice: '1500000000',
          status: 1,
          logs: []
        })
      };

      relayer = new PaymentRelayer({}, mockProvider as any);

      const result = await relayer.relayUserOp(mockUserOp);

      expect(result.transactionHash).toBe('0xtimeoutfallback');
    });
  });

  describe('estimateGas', () => {
    const mockUserOp: UserOperation = {
      sender: '0x1234567890123456789012345678901234567890',
      nonce: '0x0',
      initCode: '0x',
      callData: '0x',
      callGasLimit: '0x186A0',
      verificationGasLimit: '0xC350',
      preVerificationGas: '0x5208',
      maxFeePerGas: '0x59682F00',
      maxPriorityFeePerGas: '0x59682F00',
      paymasterAndData: '0x',
      signature: '0x'
    };

    it('should estimate gas successfully', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: expect.any(Number),
        result: {
          preVerificationGas: '0x5208',
          verificationGasLimit: '0xC350',
          callGasLimit: '0x186A0'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await relayer.estimateGas(mockUserOp);

      expect(result).toBe('0x5208');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-bundler.com',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('eth_estimateUserOperationGas')
        })
      );
    });

    it('should return default gas on estimation failure', async () => {
      mockFetch.mockRejectedValue(new Error('Estimation failed'));

      const result = await relayer.estimateGas(mockUserOp);

      expect(result).toBe('21000');
    });
  });

  describe('getUserOpStatus', () => {
    it('should get user operation status successfully', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: expect.any(Number),
        result: {
          success: true,
          transactionHash: '0xtxhash123'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await relayer.getUserOpStatus('0xuserophash123');

      expect(result).toEqual({
        status: 'mined',
        transactionHash: '0xtxhash123'
      });
    });

    it('should return pending status when operation not found', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: expect.any(Number),
        result: null
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await relayer.getUserOpStatus('0xuserophash123');

      expect(result).toEqual({
        status: 'pending'
      });
    });

    it('should return failed status when operation failed', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: expect.any(Number),
        result: {
          success: false,
          error: 'User operation failed'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await relayer.getUserOpStatus('0xuserophash123');

      expect(result).toEqual({
        status: 'failed',
        error: 'User operation failed'
      });
    });
  });

  describe('getSupportedEntryPoints', () => {
    it('should get supported entry points successfully', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: expect.any(Number),
        result: [
          '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
          '0x1234567890123456789012345678901234567890'
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await relayer.getSupportedEntryPoints();

      expect(result).toEqual([
        '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
        '0x1234567890123456789012345678901234567890'
      ]);
    });

    it('should return default entry point on failure', async () => {
      mockFetch.mockRejectedValue(new Error('Request failed'));

      const result = await relayer.getSupportedEntryPoints();

      expect(result).toEqual(['0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789']);
    });
  });
});

describe('createUserOperation', () => {
  it('should create user operation with default values', () => {
    const userOp = createUserOperation(
      '0x1234567890123456789012345678901234567890',
      '0x12345678'
    );

    expect(userOp).toEqual({
      sender: '0x1234567890123456789012345678901234567890',
      nonce: '0x0',
      initCode: '0x',
      callData: '0x12345678',
      callGasLimit: '0x186A0',
      verificationGasLimit: '0xC350',
      preVerificationGas: '0x5208',
      maxFeePerGas: '0x59682F00',
      maxPriorityFeePerGas: '0x59682F00',
      paymasterAndData: '0x',
      signature: '0x'
    });
  });

  it('should create user operation with custom paymaster data', () => {
    const userOp = createUserOperation(
      '0x1234567890123456789012345678901234567890',
      '0x12345678',
      '0xpaymasterdata'
    );

    expect(userOp.paymasterAndData).toBe('0xpaymasterdata');
  });
});

describe('validateUserOperation', () => {
  it('should validate correct user operation', () => {
    const userOp: UserOperation = {
      sender: '0x1234567890123456789012345678901234567890',
      nonce: '0x0',
      initCode: '0x',
      callData: '0x12345678',
      callGasLimit: '0x186A0',
      verificationGasLimit: '0xC350',
      preVerificationGas: '0x5208',
      maxFeePerGas: '0x59682F00',
      maxPriorityFeePerGas: '0x59682F00',
      paymasterAndData: '0x',
      signature: '0x'
    };

    const result = validateUserOperation(userOp);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should detect invalid sender address', () => {
    const userOp: UserOperation = {
      sender: 'invalid-address',
      nonce: '0x0',
      initCode: '0x',
      callData: '0x12345678',
      callGasLimit: '0x186A0',
      verificationGasLimit: '0xC350',
      preVerificationGas: '0x5208',
      maxFeePerGas: '0x59682F00',
      maxPriorityFeePerGas: '0x59682F00',
      paymasterAndData: '0x',
      signature: '0x'
    };

    const result = validateUserOperation(userOp);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid sender address');
  });

  it('should detect missing call data', () => {
    const userOp: UserOperation = {
      sender: '0x1234567890123456789012345678901234567890',
      nonce: '0x0',
      initCode: '0x',
      callData: '0x',
      callGasLimit: '0x186A0',
      verificationGasLimit: '0xC350',
      preVerificationGas: '0x5208',
      maxFeePerGas: '0x59682F00',
      maxPriorityFeePerGas: '0x59682F00',
      paymasterAndData: '0x',
      signature: '0x'
    };

    const result = validateUserOperation(userOp);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Call data is required');
  });

  it('should detect multiple validation errors', () => {
    const userOp: UserOperation = {
      sender: 'invalid-address',
      nonce: '0x0',
      initCode: '0x',
      callData: '0x',
      callGasLimit: '0x0',
      verificationGasLimit: '0x0',
      preVerificationGas: '0x5208',
      maxFeePerGas: '0x0',
      maxPriorityFeePerGas: '0x0',
      paymasterAndData: '0x',
      signature: '0x'
    };

    const result = validateUserOperation(userOp);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid sender address');
    expect(result.errors).toContain('Call data is required');
    expect(result.errors).toContain('Call gas limit is required');
    expect(result.errors).toContain('Verification gas limit is required');
    expect(result.errors).toContain('Max fee per gas is required');
    expect(result.errors).toContain('Max priority fee per gas is required');
  });
}); 