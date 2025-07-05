import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { DeedTokenizationService } from '../src/deedTokenization';
import { Property } from '@escrow/schemas';

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
    mint: jest.fn().mockResolvedValue({
      wait: jest.fn().mockResolvedValue({
        events: [{ args: { tokenId: '123' } }],
      }),
    }),
    revokePropertyToken: jest.fn().mockResolvedValue({
      wait: jest.fn().mockResolvedValue({}),
    }),
  })),
  utils: {
    keccak256: jest.fn().mockReturnValue('0x1234567890abcdef'),
    defaultAbiCoder: {
      encode: jest.fn().mockReturnValue('0xencoded'),
    },
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
      }),
      add: jest.fn().mockResolvedValue({}),
      where: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            empty: false,
            docs: [{ id: 'token123' }],
          }),
        }),
      }),
    }),
  }),
}));

describe('DeedTokenizationService', () => {
  let service: DeedTokenizationService;
  let mockProperty: Property;

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
      documentUri: 'https://ipfs.io/ipfs/QmExample',
      verified: false,
    };
  });

  describe('tokenizeDeed', () => {
    it('should successfully tokenize a property deed', async () => {
      const dealId = 'DEAL001';
      const tokenId = await service.tokenizeDeed(dealId, mockProperty);

      expect(tokenId).toBeDefined();
      expect(typeof tokenId).toBe('string');
    });

    it('should validate property data before tokenization', async () => {
      const invalidProperty = {
        ...mockProperty,
        owner: 'invalid-address', // Invalid Ethereum address
      };

      await expect(service.tokenizeDeed('DEAL001', invalidProperty as Property))
        .rejects.toThrow('Failed to tokenize deed');
    });

    it('should reject properties with invalid coordinates', async () => {
      const invalidProperty = {
        ...mockProperty,
        coordinates: {
          lat: 100, // Invalid latitude
          lng: -74.0060,
        },
      };

      await expect(service.tokenizeDeed('DEAL001', invalidProperty as Property))
        .rejects.toThrow('Failed to tokenize deed');
    });

    it('should reject properties with negative valuation', async () => {
      const invalidProperty = {
        ...mockProperty,
        valuation: -1000,
      };

      await expect(service.tokenizeDeed('DEAL001', invalidProperty as Property))
        .rejects.toThrow('Failed to tokenize deed');
    });
  });

  describe('verifyPropertyDeed', () => {
    it('should successfully verify a property deed with valid signature', async () => {
      const dealId = 'DEAL001';
      const signedDocHash = '0x1234567890abcdef';

      const result = await service.verifyPropertyDeed(dealId, signedDocHash);

      expect(result).toBe(true);
    });

    it('should reject verification with invalid deal ID', async () => {
      const signedDocHash = '0x1234567890abcdef';

      const result = await service.verifyPropertyDeed('', signedDocHash);

      expect(result).toBe(false);
    });

    it('should reject verification with invalid document hash', async () => {
      const dealId = 'DEAL001';

      const result = await service.verifyPropertyDeed(dealId, '');

      expect(result).toBe(false);
    });
  });

  describe('revokePropertyToken', () => {
    it('should successfully revoke a property token', async () => {
      const tokenId = '123';
      const reason = 'Fraudulent documentation';

      await expect(service.revokePropertyToken(tokenId, reason))
        .resolves.not.toThrow();
    });

    it('should reject revocation with empty reason', async () => {
      const tokenId = '123';

      await expect(service.revokePropertyToken(tokenId, ''))
        .rejects.toThrow('Failed to revoke token');
    });
  });

  describe('schema validation', () => {
    it('should enforce required fields', () => {
      const incompleteProperty = {
        propertyId: 'PROP001',
        // Missing required fields
      };

      expect(() => Property.parse(incompleteProperty)).toThrow();
    });

    it('should validate Ethereum address format', () => {
      const invalidProperty = {
        ...mockProperty,
        owner: 'not-an-address',
      };

      expect(() => Property.parse(invalidProperty)).toThrow();
    });

    it('should validate coordinate ranges', () => {
      const invalidProperty = {
        ...mockProperty,
        coordinates: {
          lat: 91, // Invalid latitude
          lng: 181, // Invalid longitude
        },
      };

      expect(() => Property.parse(invalidProperty)).toThrow();
    });

    it('should validate positive numeric values', () => {
      const invalidProperty = {
        ...mockProperty,
        size: -100,
        valuation: 0,
      };

      expect(() => Property.parse(invalidProperty)).toThrow();
    });

    it('should validate URL format for document URI', () => {
      const invalidProperty = {
        ...mockProperty,
        documentUri: 'not-a-url',
      };

      expect(() => Property.parse(invalidProperty)).toThrow();
    });
  });

  describe('valuation bands', () => {
    it('should correctly categorize valuation bands', () => {
      const testCases = [
        { valuation: 50000, expected: 'Under $100k' },
        { valuation: 250000, expected: '$100k - $500k' },
        { valuation: 750000, expected: '$500k - $1M' },
        { valuation: 2500000, expected: '$1M - $5M' },
        { valuation: 10000000, expected: 'Over $5M' },
      ];

      testCases.forEach(({ valuation, expected }) => {
        const property = { ...mockProperty, valuation };
        // Access private method through any type assertion for testing
        const serviceAny = service as any;
        const band = serviceAny.getValuationBand(valuation);
        expect(band).toBe(expected);
      });
    });
  });
}); 