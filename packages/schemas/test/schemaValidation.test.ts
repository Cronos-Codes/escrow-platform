import { describe, it, expect, beforeEach } from '@jest/globals';
import { z } from 'zod';
import { 
  propertySchema, 
  assaySchema, 
  shipmentSchema,
  phoneOtpSchema,
  emailOtpSchema 
} from '../src/index';

describe('Schema Validation & Type Safety', () => {
  describe('Property Schema Validation', () => {
    it('should validate valid property data', () => {
      const validProperty = {
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

      const result = propertySchema.safeParse(validProperty);
      expect(result.success).toBe(true);
    });

    it('should reject invalid Ethereum addresses', () => {
      const invalidProperty = {
        propertyId: 'PROP001',
        owner: 'invalid-address',
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

      const result = propertySchema.safeParse(invalidProperty);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('owner');
      }
    });

    it('should validate coordinate ranges', () => {
      const invalidProperty = {
        propertyId: 'PROP001',
        owner: '0x1234567890123456789012345678901234567890',
        location: '123 Main St, New York, NY',
        coordinates: {
          lat: 91, // Invalid latitude > 90
          lng: -74.0060,
        },
        size: 1500,
        valuation: 750000,
        zoning: 'R-1',
        documentUri: 'ipfs://QmExample123',
        verified: false,
      };

      const result = propertySchema.safeParse(invalidProperty);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('coordinates');
      }
    });

    it('should validate IPFS URI format', () => {
      const invalidProperty = {
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
        documentUri: 'https://example.com/invalid-uri', // Not IPFS
        verified: false,
      };

      const result = propertySchema.safeParse(invalidProperty);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('documentUri');
      }
    });
  });

  describe('Assay Schema Validation', () => {
    it('should validate valid assay data', () => {
      const validAssay = {
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

      const result = assaySchema.safeParse(validAssay);
      expect(result.success).toBe(true);
    });

    it('should validate metal type enum', () => {
      const invalidAssay = {
        batchId: 'BATCH001',
        metalType: 'invalid_metal', // Not in enum
        purity: 99.95,
        weight: 1000,
        assayer: 'Certified Assayer Inc.',
        certificateUri: 'https://example.com/certificate.pdf',
        origin: 'South Africa',
        timestamp: new Date().toISOString(),
        verified: false,
      };

      const result = assaySchema.safeParse(invalidAssay);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('metalType');
      }
    });

    it('should validate purity range (0-100)', () => {
      const invalidAssay = {
        batchId: 'BATCH001',
        metalType: 'gold',
        purity: 150, // Invalid > 100%
        weight: 1000,
        assayer: 'Certified Assayer Inc.',
        certificateUri: 'https://example.com/certificate.pdf',
        origin: 'South Africa',
        timestamp: new Date().toISOString(),
        verified: false,
      };

      const result = assaySchema.safeParse(invalidAssay);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('purity');
      }
    });

    it('should validate weight is positive', () => {
      const invalidAssay = {
        batchId: 'BATCH001',
        metalType: 'gold',
        purity: 99.95,
        weight: -100, // Invalid negative weight
        assayer: 'Certified Assayer Inc.',
        certificateUri: 'https://example.com/certificate.pdf',
        origin: 'South Africa',
        timestamp: new Date().toISOString(),
        verified: false,
      };

      const result = assaySchema.safeParse(invalidAssay);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('weight');
      }
    });
  });

  describe('Shipment Schema Validation', () => {
    it('should validate valid shipment data', () => {
      const validShipment = {
        shipmentId: 'SHIP001',
        origin: 'Port of Houston',
        destination: 'Port of Rotterdam',
        quantity: 50000,
        status: 'PickedUp',
        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        carrier: 'Maersk Line',
        batchType: 'crude_oil',
        trackingUrl: 'https://tracking.maersk.com/SHIP001',
        documents: ['https://example.com/bill-of-lading.pdf'],
        verified: false,
        lastUpdated: new Date().toISOString(),
      };

      const result = shipmentSchema.safeParse(validShipment);
      expect(result.success).toBe(true);
    });

    it('should validate shipment status enum', () => {
      const invalidShipment = {
        shipmentId: 'SHIP001',
        origin: 'Port of Houston',
        destination: 'Port of Rotterdam',
        quantity: 50000,
        status: 'InvalidStatus', // Not in enum
        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        carrier: 'Maersk Line',
        batchType: 'crude_oil',
        trackingUrl: 'https://tracking.maersk.com/SHIP001',
        documents: ['https://example.com/bill-of-lading.pdf'],
        verified: false,
        lastUpdated: new Date().toISOString(),
      };

      const result = shipmentSchema.safeParse(invalidShipment);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('status');
      }
    });

    it('should validate quantity is positive', () => {
      const invalidShipment = {
        shipmentId: 'SHIP001',
        origin: 'Port of Houston',
        destination: 'Port of Rotterdam',
        quantity: -50000, // Invalid negative quantity
        status: 'PickedUp',
        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        carrier: 'Maersk Line',
        batchType: 'crude_oil',
        trackingUrl: 'https://tracking.maersk.com/SHIP001',
        documents: ['https://example.com/bill-of-lading.pdf'],
        verified: false,
        lastUpdated: new Date().toISOString(),
      };

      const result = shipmentSchema.safeParse(invalidShipment);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('quantity');
      }
    });

    it('should validate URL formats', () => {
      const invalidShipment = {
        shipmentId: 'SHIP001',
        origin: 'Port of Houston',
        destination: 'Port of Rotterdam',
        quantity: 50000,
        status: 'PickedUp',
        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        carrier: 'Maersk Line',
        batchType: 'crude_oil',
        trackingUrl: 'invalid-url', // Invalid URL
        documents: ['https://example.com/bill-of-lading.pdf'],
        verified: false,
        lastUpdated: new Date().toISOString(),
      };

      const result = shipmentSchema.safeParse(invalidShipment);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('trackingUrl');
      }
    });
  });

  describe('OTP Schema Validation', () => {
    it('should validate valid phone OTP data', () => {
      const validPhoneOtp = {
        phoneNumber: '+1234567890',
        otpCode: '123456',
      };

      const result = phoneOtpSchema.safeParse(validPhoneOtp);
      expect(result.success).toBe(true);
    });

    it('should validate phone number format', () => {
      const invalidPhoneOtp = {
        phoneNumber: 'invalid-phone',
        otpCode: '123456',
      };

      const result = phoneOtpSchema.safeParse(invalidPhoneOtp);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('phoneNumber');
      }
    });

    it('should validate OTP code format', () => {
      const invalidPhoneOtp = {
        phoneNumber: '+1234567890',
        otpCode: '12345', // Too short
      };

      const result = phoneOtpSchema.safeParse(invalidPhoneOtp);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('otpCode');
      }
    });

    it('should validate valid email OTP data', () => {
      const validEmailOtp = {
        email: 'user@example.com',
        otpCode: '123456',
      };

      const result = emailOtpSchema.safeParse(validEmailOtp);
      expect(result.success).toBe(true);
    });

    it('should validate email format', () => {
      const invalidEmailOtp = {
        email: 'invalid-email',
        otpCode: '123456',
      };

      const result = emailOtpSchema.safeParse(invalidEmailOtp);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });
  });

  describe('Schema Drift Prevention', () => {
    it('should ensure property schema matches contract events', () => {
      // Mock contract event structure
      const contractEvent = {
        tokenId: '123',
        propertyId: 'PROP001',
        dealId: 'DEAL001',
        owner: '0x1234567890123456789012345678901234567890',
        location: '123 Main St',
        valuation: '750000',
      };

      // Extract relevant fields for schema validation
      const eventData = {
        propertyId: contractEvent.propertyId,
        owner: contractEvent.owner,
        location: contractEvent.location,
        valuation: parseInt(contractEvent.valuation),
        coordinates: { lat: 40.7128, lng: -74.0060 },
        size: 1500,
        zoning: 'R-1',
        documentUri: 'ipfs://QmExample123',
        verified: false,
      };

      const result = propertySchema.safeParse(eventData);
      expect(result.success).toBe(true);
    });

    it('should ensure assay schema matches oracle responses', () => {
      // Mock oracle response structure
      const oracleResponse = {
        batchId: 'BATCH001',
        metalType: 'gold',
        purity: 99.95,
        weight: 1000,
        assayer: 'Certified Assayer Inc.',
        certificateUri: 'https://example.com/certificate.pdf',
        origin: 'South Africa',
        timestamp: new Date().toISOString(),
        verified: true,
      };

      const result = assaySchema.safeParse(oracleResponse);
      expect(result.success).toBe(true);
    });

    it('should ensure shipment schema matches tracking API responses', () => {
      // Mock tracking API response structure
      const trackingResponse = {
        shipmentId: 'SHIP001',
        origin: 'Port of Houston',
        destination: 'Port of Rotterdam',
        quantity: 50000,
        status: 'InTransit',
        expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        carrier: 'Maersk Line',
        batchType: 'crude_oil',
        trackingUrl: 'https://tracking.maersk.com/SHIP001',
        documents: ['https://example.com/bill-of-lading.pdf'],
        verified: false,
        lastUpdated: new Date().toISOString(),
      };

      const result = shipmentSchema.safeParse(trackingResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('Type Safety & Inference', () => {
    it('should provide correct TypeScript types', () => {
      // This test ensures TypeScript can infer the correct types
      const propertyData = {
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

      const result = propertySchema.parse(propertyData);
      
      // TypeScript should infer the correct type
      expect(typeof result.propertyId).toBe('string');
      expect(typeof result.owner).toBe('string');
      expect(typeof result.coordinates.lat).toBe('number');
      expect(typeof result.coordinates.lng).toBe('number');
      expect(typeof result.size).toBe('number');
      expect(typeof result.valuation).toBe('number');
      expect(typeof result.verified).toBe('boolean');
    });

    it('should handle optional fields correctly', () => {
      const partialProperty = {
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
        // verified is optional, should default to false
      };

      const result = propertySchema.parse(partialProperty);
      expect(result.verified).toBe(false); // Default value
    });

    it('should handle array validation correctly', () => {
      const shipmentWithMultipleDocuments = {
        shipmentId: 'SHIP001',
        origin: 'Port of Houston',
        destination: 'Port of Rotterdam',
        quantity: 50000,
        status: 'PickedUp',
        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        carrier: 'Maersk Line',
        batchType: 'crude_oil',
        trackingUrl: 'https://tracking.maersk.com/SHIP001',
        documents: [
          'https://example.com/bill-of-lading.pdf',
          'https://example.com/certificate.pdf',
          'https://example.com/insurance.pdf',
        ],
        verified: false,
        lastUpdated: new Date().toISOString(),
      };

      const result = shipmentSchema.parse(shipmentWithMultipleDocuments);
      expect(Array.isArray(result.documents)).toBe(true);
      expect(result.documents).toHaveLength(3);
    });
  });

  describe('Performance & Edge Cases', () => {
    it('should handle large datasets efficiently', () => {
      const largeProperty = {
        propertyId: 'PROP001',
        owner: '0x1234567890123456789012345678901234567890',
        location: 'A'.repeat(1000), // Very long location
        coordinates: {
          lat: 40.7128,
          lng: -74.0060,
        },
        size: 999999999,
        valuation: 999999999999,
        zoning: 'R-1',
        documentUri: 'ipfs://QmExample123',
        verified: false,
      };

      const startTime = Date.now();
      const result = propertySchema.safeParse(largeProperty);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });

    it('should handle empty strings and null values', () => {
      const invalidProperty = {
        propertyId: '',
        owner: '0x1234567890123456789012345678901234567890',
        location: null,
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

      const result = propertySchema.safeParse(invalidProperty);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should handle special characters in strings', () => {
      const propertyWithSpecialChars = {
        propertyId: 'PROP001',
        owner: '0x1234567890123456789012345678901234567890',
        location: '123 Main St, New York, NY 🏠',
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

      const result = propertySchema.safeParse(propertyWithSpecialChars);
      expect(result.success).toBe(true);
    });
  });
}); 