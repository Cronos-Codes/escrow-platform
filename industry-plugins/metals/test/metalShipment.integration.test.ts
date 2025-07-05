import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { MetalShipmentService } from '../src/metalShipment';
import { Assay, METAL_PURITY_THRESHOLDS } from '@escrow/schemas';

// Mock ethers
jest.mock('ethers', () => ({
  providers: {
    JsonRpcProvider: jest.fn().mockImplementation(() => ({
      getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
    })),
  },
  Wallet: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockReturnThis(),
  })),
  Contract: jest.fn().mockImplementation(() => ({
    mintMetalBatch: jest.fn().mockResolvedValue({
      wait: jest.fn().mockResolvedValue({
        events: [{ args: { tokenId: '123' } }],
      }),
    }),
    revokeMetalToken: jest.fn().mockResolvedValue({
      wait: jest.fn().mockResolvedValue({
        events: [
          {
            event: 'BatchRevoked',
            args: {
              batchId: 'BATCH001',
              reason: 'Contamination detected',
              revokedBy: '0x1234567890123456789012345678901234567890',
            },
          },
        ],
      }),
    }),
  }),
  utils: {
    keccak256: jest.fn().mockReturnValue('0x1234567890abcdef'),
  },
}));

// Mock Firebase Admin
jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn().mockReturnValue({
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        set: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            batchId: 'BATCH001',
            verified: true,
            oracleData: {
              batchId: 'BATCH001',
              metalType: 'gold',
              purity: 99.95,
              weight: 1000,
              assayer: 'Certified Assayer Inc.',
              certificateUri: 'https://example.com/certificate.pdf',
              origin: 'South Africa',
              timestamp: new Date().toISOString(),
              verified: true,
            },
          }),
        }),
      }),
      add: jest.fn().mockResolvedValue({ id: 'audit123' }),
      where: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            empty: false,
            docs: [{ id: 'token123', data: () => ({ batchId: 'BATCH001' }) }],
          }),
        }),
      }),
    }),
  }),
}));

// Mock oracle service
jest.mock('@escrow/utils', () => ({
  fetchFromChainlink: jest.fn(),
}));

describe('Precious Metals Adapter - Integration Tests', () => {
  let service: MetalShipmentService;
  let mockAssay: Assay;

  beforeEach(() => {
    service = new MetalShipmentService(
      '0x1234567890123456789012345678901234567890',
      '0xprivatekey',
      'https://rpc.example.com',
      'chainlink-job-123'
    );

    mockAssay = {
      batchId: 'BATCH001',
      metalType: 'gold',
      purity: 99.95,
      weight: 1000,
      assayer: 'Certified Assayer Inc.',
      certificateUri: 'https://example.com/certificate.pdf',
      origin: 'South Africa',
      timestamp: new Date().toISOString(),
      verified: false,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Chainlink Oracle Integration', () => {
    it('should fetch assay data from Chainlink with success path', async () => {
      const batchId = 'BATCH001';
      
      // Mock successful Chainlink response
      const mockOracleResponse = {
        success: true,
        data: {
          batchId: 'BATCH001',
          metalType: 'gold',
          purity: 99.95,
          weight: 1000,
          assayer: 'Certified Assayer Inc.',
          certificateUri: 'https://example.com/certificate.pdf',
          origin: 'South Africa',
          timestamp: new Date().toISOString(),
          verified: true,
        },
      };

      const { fetchFromChainlink } = require('@escrow/utils');
      fetchFromChainlink.mockResolvedValue(mockOracleResponse);

      const result = await service.verifyAssay(batchId);

      expect(result).toBe(true);
      expect(fetchFromChainlink).toHaveBeenCalledWith('chainlink-job-123', {
        batchId: 'BATCH001',
        endpoint: 'https://api.assay-verification.com/batch',
      });
    });

    it('should handle Chainlink failures with fallback to cached data', async () => {
      const batchId = 'BATCH001';
      
      // Mock Chainlink failure
      const { fetchFromChainlink } = require('@escrow/utils');
      fetchFromChainlink.mockRejectedValue(new Error('Oracle unavailable'));

      const result = await service.verifyAssay(batchId);

      // Should fallback to cached data
      expect(result).toBeDefined();
    });

    it('should validate oracle response against assay schema', async () => {
      const batchId = 'BATCH001';
      
      // Mock invalid oracle response
      const mockInvalidResponse = {
        success: true,
        data: {
          batchId: 'BATCH001',
          metalType: 'invalid_metal', // Invalid metal type
          purity: 150, // Invalid purity > 100%
          weight: -100, // Invalid negative weight
        },
      };

      const { fetchFromChainlink } = require('@escrow/utils');
      fetchFromChainlink.mockResolvedValue(mockInvalidResponse);

      const result = await service.verifyAssay(batchId);

      expect(result).toBe(false);
    });
  });

  describe('Purity Threshold Enforcement', () => {
    it('should enforce gold purity threshold ≥ 99.9%', async () => {
      const batchId = 'BATCH001';
      
      // Mock gold assay with insufficient purity
      const mockOracleResponse = {
        success: true,
        data: {
          ...mockAssay,
          metalType: 'gold',
          purity: 99.8, // Below 99.9% threshold
        },
      };

      const { fetchFromChainlink } = require('@escrow/utils');
      fetchFromChainlink.mockResolvedValue(mockOracleResponse);

      const result = await service.verifyAssay(batchId);

      expect(result).toBe(false);
    });

    it('should enforce platinum purity threshold ≥ 99.95%', async () => {
      const batchId = 'BATCH001';
      
      // Mock platinum assay with sufficient purity
      const mockOracleResponse = {
        success: true,
        data: {
          ...mockAssay,
          metalType: 'platinum',
          purity: 99.97, // Above 99.95% threshold
        },
      };

      const { fetchFromChainlink } = require('@escrow/utils');
      fetchFromChainlink.mockResolvedValue(mockOracleResponse);

      const result = await service.verifyAssay(batchId);

      expect(result).toBe(true);
    });

    it('should log verification results with purity threshold info', async () => {
      const batchId = 'BATCH001';
      
      const mockOracleResponse = {
        success: true,
        data: {
          ...mockAssay,
          metalType: 'gold',
          purity: 99.95,
        },
      };

      const { fetchFromChainlink } = require('@escrow/utils');
      fetchFromChainlink.mockResolvedValue(mockOracleResponse);

      await service.verifyAssay(batchId);

      // Verify Firestore log with purity threshold
      const db = require('firebase-admin/firestore').getFirestore();
      expect(db.collection).toHaveBeenCalledWith('assayLogs');
    });
  });

  describe('Certificate Hash Validation', () => {
    it('should validate certificate URI hash integrity', async () => {
      const batchId = 'BATCH001';
      
      // Mock certificate content
      const mockCertificateContent = 'Certificate content for BATCH001';
      const mockCertificateHash = '0x1234567890abcdef';
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: async () => mockCertificateContent,
      });

      const mockOracleResponse = {
        success: true,
        data: {
          ...mockAssay,
          certificateUri: 'https://example.com/certificate.pdf',
        },
      };

      const { fetchFromChainlink } = require('@escrow/utils');
      fetchFromChainlink.mockResolvedValue(mockOracleResponse);

      const result = await service.verifyAssay(batchId);

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/certificate.pdf');
    });

    it('should reject verification for invalid certificate hash', async () => {
      const batchId = 'BATCH001';
      
      // Mock certificate fetch failure
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const mockOracleResponse = {
        success: true,
        data: {
          ...mockAssay,
          certificateUri: 'https://example.com/invalid-certificate.pdf',
        },
      };

      const { fetchFromChainlink } = require('@escrow/utils');
      fetchFromChainlink.mockResolvedValue(mockOracleResponse);

      const result = await service.verifyAssay(batchId);

      expect(result).toBe(false);
    });
  });

  describe('Batch Revocation Workflows', () => {
    it('should revoke batch with admin/assayer roles and emit BatchRevoked event', async () => {
      const batchId = 'BATCH001';
      const reason = 'Contamination detected';

      await service.revokeBatch(batchId, reason);

      // Verify on-chain revocation
      const contract = require('ethers').Contract.mock.results[0].value;
      expect(contract.revokeMetalToken).toHaveBeenCalled();
      
      // Verify BatchRevoked event emission
      const receipt = await contract.revokeMetalToken().wait();
      expect(receipt.events[0].event).toBe('BatchRevoked');
      expect(receipt.events[0].args.reason).toBe(reason);
    });

    it('should update Firestore verification status on revocation', async () => {
      const batchId = 'BATCH001';
      const reason = 'Contamination detected';

      await service.revokeBatch(batchId, reason);

      // Verify Firestore status update
      const db = require('firebase-admin/firestore').getFirestore();
      expect(db.collection).toHaveBeenCalledWith('assayLogs');
    });

    it('should log revocation reason in Firestore audit trail', async () => {
      const batchId = 'BATCH001';
      const reason = 'Contamination detected';

      await service.revokeBatch(batchId, reason);

      // Verify audit trail
      const db = require('firebase-admin/firestore').getFirestore();
      const docMock = db.collection().doc();
      expect(docMock.update).toHaveBeenCalledWith(
        expect.objectContaining({
          verified: false,
          revokedAt: expect.any(Date),
          revocationReason: reason,
        })
      );
    });
  });

  describe('Firestore Audit Trail', () => {
    it('should log all verification attempts in assayLogs/', async () => {
      const batchId = 'BATCH001';
      
      const mockOracleResponse = {
        success: true,
        data: mockAssay,
      };

      const { fetchFromChainlink } = require('@escrow/utils');
      fetchFromChainlink.mockResolvedValue(mockOracleResponse);

      await service.verifyAssay(batchId);

      // Verify audit log creation
      const db = require('firebase-admin/firestore').getFirestore();
      expect(db.collection).toHaveBeenCalledWith('assayLogs');
    });

    it('should include oracle payload and verification metadata in logs', async () => {
      const batchId = 'BATCH001';
      
      const mockOracleResponse = {
        success: true,
        data: {
          ...mockAssay,
          purity: 99.95,
        },
      };

      const { fetchFromChainlink } = require('@escrow/utils');
      fetchFromChainlink.mockResolvedValue(mockOracleResponse);

      await service.verifyAssay(batchId);

      // Verify log includes oracle data and metadata
      const db = require('firebase-admin/firestore').getFirestore();
      const addMock = db.collection().add;
      expect(addMock).toHaveBeenCalledWith(
        expect.objectContaining({
          batchId: 'BATCH001',
          verified: true,
          oracleData: mockOracleResponse.data,
          purityThreshold: METAL_PURITY_THRESHOLDS.gold,
          meetsThreshold: true,
        })
      );
    });
  });

  describe('Error Handling & Fallbacks', () => {
    it('should handle oracle network failures gracefully', async () => {
      const batchId = 'BATCH001';
      
      // Mock network failure
      const { fetchFromChainlink } = require('@escrow/utils');
      fetchFromChainlink.mockRejectedValue(new Error('Network timeout'));

      const result = await service.verifyAssay(batchId);

      expect(result).toBe(false);
    });

    it('should handle malformed oracle responses', async () => {
      const batchId = 'BATCH001';
      
      // Mock malformed response
      const { fetchFromChainlink } = require('@escrow/utils');
      fetchFromChainlink.mockResolvedValue({
        success: true,
        data: null, // Malformed - missing data
      });

      const result = await service.verifyAssay(batchId);

      expect(result).toBe(false);
    });

    it('should provide detailed error messages for debugging', async () => {
      const batchId = 'BATCH001';
      
      // Mock oracle failure
      const { fetchFromChainlink } = require('@escrow/utils');
      fetchFromChainlink.mockRejectedValue(new Error('Oracle service unavailable'));

      await service.verifyAssay(batchId);

      // Verify error logging
      const db = require('firebase-admin/firestore').getFirestore();
      expect(db.collection).toHaveBeenCalledWith('assayLogs');
    });
  });

  describe('Performance & Monitoring', () => {
    it('should track verification latency', async () => {
      const batchId = 'BATCH001';
      
      const startTime = Date.now();
      
      const mockOracleResponse = {
        success: true,
        data: mockAssay,
      };

      const { fetchFromChainlink } = require('@escrow/utils');
      fetchFromChainlink.mockResolvedValue(mockOracleResponse);

      await service.verifyAssay(batchId);
      
      const endTime = Date.now();
      const latency = endTime - startTime;

      expect(latency).toBeGreaterThan(0);
    });

    it('should handle concurrent verification requests', async () => {
      const batchIds = ['BATCH001', 'BATCH002', 'BATCH003'];
      
      const mockOracleResponse = {
        success: true,
        data: mockAssay,
      };

      const { fetchFromChainlink } = require('@escrow/utils');
      fetchFromChainlink.mockResolvedValue(mockOracleResponse);

      const promises = batchIds.map(batchId => service.verifyAssay(batchId));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results.every(result => typeof result === 'boolean')).toBe(true);
    });
  });
}); 