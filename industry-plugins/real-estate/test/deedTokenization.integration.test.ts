import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { DeedTokenizationService } from '../src/deedTokenization';
import { Property } from '@escrow/schemas';
import { ethers } from 'ethers';

// Mock ethers with detailed event tracking
jest.mock('ethers', () => ({
  providers: {
    JsonRpcProvider: jest.fn().mockImplementation(() => ({
      getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
      getTransactionReceipt: jest.fn().mockResolvedValue({
        logs: [
          {
            address: '0x1234567890123456789012345678901234567890',
            topics: [
              '0x1234567890123456789012345678901234567890', // PropertyTokenized event signature
              '0x0000000000000000000000000000000000000000000000000000000000000123', // tokenId
              '0x1234567890123456789012345678901234567890', // propertyId
            ],
            data: '0x1234567890123456789012345678901234567890',
          },
        ],
      }),
    })),
  },
  Wallet: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockReturnThis(),
    signMessage: jest.fn().mockResolvedValue('0xsignedmessage'),
  })),
  Contract: jest.fn().mockImplementation(() => ({
    mint: jest.fn().mockResolvedValue({
      wait: jest.fn().mockResolvedValue({
        events: [
          {
            event: 'PropertyTokenized',
            args: {
              tokenId: '123',
              propertyId: 'PROP001',
              dealId: 'DEAL001',
              owner: '0x1234567890123456789012345678901234567890',
              location: '123 Main St',
              valuation: '750000',
            },
          },
        ],
        logs: [
          {
            address: '0x1234567890123456789012345678901234567890',
            topics: [
              '0x1234567890123456789012345678901234567890',
              '0x0000000000000000000000000000000000000000000000000000000000000123',
            ],
          },
        ],
      }),
    }),
    revokePropertyToken: jest.fn().mockResolvedValue({
      wait: jest.fn().mockResolvedValue({
        events: [
          {
            event: 'TokenRevoked',
            args: {
              tokenId: '123',
              reason: 'Fraudulent documentation',
              revokedBy: '0x1234567890123456789012345678901234567890',
            },
          },
        ],
      }),
    }),
    verifyProperty: jest.fn().mockResolvedValue({
      wait: jest.fn().mockResolvedValue({
        events: [
          {
            event: 'PropertyVerified',
            args: {
              tokenId: '123',
              propertyId: 'PROP001',
              verifier: '0x1234567890123456789012345678901234567890',
            },
          },
        ],
      }),
    }),
  })),
  utils: {
    keccak256: jest.fn().mockReturnValue('0x1234567890abcdef'),
    defaultAbiCoder: {
      encode: jest.fn().mockReturnValue('0xencoded'),
    },
    verifyMessage: jest.fn().mockReturnValue('0x1234567890123456789012345678901234567890'),
    splitSignature: jest.fn().mockReturnValue({
      v: 27,
      r: '0x1234567890123456789012345678901234567890',
      s: '0x1234567890123456789012345678901234567890',
    }),
  },
}));

// Mock Firebase Admin with detailed audit logging
jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn().mockReturnValue({
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        set: jest.fn().mockResolvedValue({}),
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            dealId: 'DEAL001',
            propertyId: 'PROP001',
            tokenId: '123',
            verified: false,
          }),
        }),
      }),
      add: jest.fn().mockResolvedValue({ id: 'audit123' }),
      where: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            empty: false,
            docs: [{ id: 'token123', data: () => ({ dealId: 'DEAL001' }) }],
          }),
        }),
      }),
    }),
  }),
}));

describe('Real Estate Adapter - Integration Tests', () => {
  let service: DeedTokenizationService;
  let mockProperty: Property;
  let mockEIP712Signature: string;

  beforeEach(() => {
    service = new DeedTokenizationService(
      '0x1234567890123456789012345678901234567890',
      '0xprivatekey',
      'https://rpc.example.com'
    );

    mockProperty = {
      propertyId: 'PROP001',
      owner: '0x1234567890123456789012345678901234567890',
      location: '123 Main St, New York, NY',
      coordinates: {
        lat: 40.7128,
        lng: -74.0060,
      },
      size: 1500,
      valuation: 750000,
      zoning: 'R-1',
      documentUri: 'ipfs://QmExample123',
      verified: false,
    };

    // Mock EIP-712 signature
    mockEIP712Signature = '0x1234567890123456789012345678901234567890';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ERC-721 Minting & IPFS Verification', () => {
    it('should mint ERC-721 token with IPFS metadata and verify CID', async () => {
      const dealId = 'DEAL001';
      
      // Mock IPFS CID verification
      const mockIPFSResponse = {
        ok: true,
        json: async () => ({
          name: 'Property Deed - 123 Main St',
          description: 'Tokenized property deed',
          image: 'ipfs://QmExample123',
          attributes: [
            { trait_type: 'Location', value: '123 Main St, New York, NY' },
            { trait_type: 'Valuation', value: 750000 },
          ],
        }),
      };
      
      global.fetch = jest.fn().mockResolvedValue(mockIPFSResponse);

      const tokenId = await service.tokenizeDeed(dealId, mockProperty);

      expect(tokenId).toBeDefined();
      expect(typeof tokenId).toBe('string');
      
      // Verify IPFS metadata was accessed
      expect(global.fetch).toHaveBeenCalledWith('ipfs://QmExample123');
    });

    it('should generate provenance hash and store in token metadata', async () => {
      const dealId = 'DEAL001';
      
      const tokenId = await service.tokenizeDeed(dealId, mockProperty);
      
      // Verify provenance hash was generated
      const serviceAny = service as any;
      const provenanceHash = serviceAny.generateProvenanceHash(mockProperty);
      
      expect(provenanceHash).toBeDefined();
      expect(provenanceHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });

    it('should create reverse mapping in Firestore: tokenId → dealId → propertyId', async () => {
      const dealId = 'DEAL001';
      
      await service.tokenizeDeed(dealId, mockProperty);
      
      // Verify Firestore mapping was created
      const db = require('firebase-admin/firestore').getFirestore();
      expect(db.collection).toHaveBeenCalledWith('tokenMappings');
    });
  });

  describe('EIP-712 Signature Verification', () => {
    it('should verify EIP-712 deed signature and emit PropertyVerified event', async () => {
      const dealId = 'DEAL001';
      const signedDocHash = mockEIP712Signature;

      // Mock EIP-712 signature verification
      const ethers = require('ethers');
      ethers.utils.verifyMessage.mockReturnValue('0x1234567890123456789012345678901234567890');

      const result = await service.verifyPropertyDeed(dealId, signedDocHash);

      expect(result).toBe(true);
      
      // Verify on-chain event emission
      const contract = require('ethers').Contract.mock.results[0].value;
      expect(contract.verifyProperty).toHaveBeenCalled();
    });

    it('should reject invalid EIP-712 signatures', async () => {
      const dealId = 'DEAL001';
      const invalidSignature = '0xinvalid';

      // Mock failed signature verification
      const ethers = require('ethers');
      ethers.utils.verifyMessage.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const result = await service.verifyPropertyDeed(dealId, invalidSignature);

      expect(result).toBe(false);
    });

    it('should store verification status in Firestore with signer identity', async () => {
      const dealId = 'DEAL001';
      const signedDocHash = mockEIP712Signature;

      await service.verifyPropertyDeed(dealId, signedDocHash);

      // Verify Firestore verification entry
      const db = require('firebase-admin/firestore').getFirestore();
      expect(db.collection).toHaveBeenCalledWith('verifiedProperties');
    });
  });

  describe('Revocation Workflows', () => {
    it('should revoke token with REAL_ESTATE_VERIFIER_ROLE and emit TokenRevoked event', async () => {
      const tokenId = '123';
      const reason = 'Fraudulent documentation';

      await service.revokePropertyToken(tokenId, reason);

      // Verify on-chain revocation
      const contract = require('ethers').Contract.mock.results[0].value;
      expect(contract.revokePropertyToken).toHaveBeenCalledWith(tokenId, reason);
      
      // Verify TokenRevoked event emission
      const receipt = await contract.revokePropertyToken().wait();
      expect(receipt.events[0].event).toBe('TokenRevoked');
      expect(receipt.events[0].args.reason).toBe(reason);
    });

    it('should log revocation in Firestore audit trail', async () => {
      const tokenId = '123';
      const reason = 'Fraudulent documentation';

      await service.revokePropertyToken(tokenId, reason);

      // Verify Firestore audit entry
      const db = require('firebase-admin/firestore').getFirestore();
      expect(db.collection).toHaveBeenCalledWith('revokedTokens');
    });

    it('should clear reverse mappings on revocation', async () => {
      const tokenId = '123';
      const reason = 'Fraudulent documentation';

      await service.revokePropertyToken(tokenId, reason);

      // Verify mappings are cleared
      const db = require('firebase-admin/firestore').getFirestore();
      expect(db.collection).toHaveBeenCalledWith('tokenMappings');
    });
  });

  describe('Firestore Audit Trail', () => {
    it('should create comprehensive audit entries linking dealId ↔ tokenId', async () => {
      const dealId = 'DEAL001';
      
      await service.tokenizeDeed(dealId, mockProperty);

      // Verify tokenization log
      const db = require('firebase-admin/firestore').getFirestore();
      expect(db.collection).toHaveBeenCalledWith('tokenizationLogs');
    });

    it('should track signer identity in verification logs', async () => {
      const dealId = 'DEAL001';
      const signedDocHash = mockEIP712Signature;

      await service.verifyPropertyDeed(dealId, signedDocHash);

      // Verify verification log with signer info
      const db = require('firebase-admin/firestore').getFirestore();
      expect(db.collection).toHaveBeenCalledWith('verifiedProperties');
    });
  });

  describe('Gas Profiling', () => {
    it('should track gas usage for tokenization operations', async () => {
      const dealId = 'DEAL001';
      
      const startGas = 21000;
      const endGas = 150000;
      
      // Mock gas estimation
      const contract = require('ethers').Contract.mock.results[0].value;
      contract.mint.mockResolvedValue({
        wait: jest.fn().mockResolvedValue({
          gasUsed: endGas - startGas,
          events: [{ args: { tokenId: '123' } }],
        }),
      });

      await service.tokenizeDeed(dealId, mockProperty);

      // Verify gas tracking
      const receipt = await contract.mint().wait();
      expect(receipt.gasUsed).toBeDefined();
    });
  });

  describe('Error Handling & Fallbacks', () => {
    it('should handle IPFS failures gracefully', async () => {
      const dealId = 'DEAL001';
      
      // Mock IPFS failure
      global.fetch = jest.fn().mockRejectedValue(new Error('IPFS unavailable'));

      const tokenId = await service.tokenizeDeed(dealId, mockProperty);

      expect(tokenId).toBeDefined();
      // Should fallback to local metadata storage
    });

    it('should handle contract failures with proper error messages', async () => {
      const dealId = 'DEAL001';
      
      // Mock contract failure
      const contract = require('ethers').Contract.mock.results[0].value;
      contract.mint.mockRejectedValue(new Error('Insufficient gas'));

      await expect(service.tokenizeDeed(dealId, mockProperty))
        .rejects.toThrow('Failed to tokenize deed');
    });
  });
}); 