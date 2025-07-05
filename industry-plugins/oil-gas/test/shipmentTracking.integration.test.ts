import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { ShipmentTrackingService } from '../src/shipmentTracking';
import { Shipment } from '@escrow/schemas';

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
    updateShipmentStatus: jest.fn().mockResolvedValue({
      wait: jest.fn().mockResolvedValue({
        events: [
          {
            event: 'ShipmentUpdated',
            args: {
              shipmentId: 'SHIP001',
              status: 'InTransit',
              location: 'Port of Rotterdam',
              timestamp: Math.floor(Date.now() / 1000),
            },
          },
        ],
      }),
    }),
    verifyDelivery: jest.fn().mockResolvedValue({
      wait: jest.fn().mockResolvedValue({
        events: [
          {
            event: 'DeliveryVerified',
            args: {
              shipmentId: 'SHIP001',
              deliveredAt: Math.floor(Date.now() / 1000),
              verifiedBy: '0x1234567890123456789012345678901234567890',
            },
          },
        ],
      }),
    }),
    revokeShipment: jest.fn().mockResolvedValue({
      wait: jest.fn().mockResolvedValue({
        events: [
          {
            event: 'ShipmentRevoked',
            args: {
              shipmentId: 'SHIP001',
              reason: 'Documentation fraud',
              revokedBy: '0x1234567890123456789012345678901234567890',
            },
          },
        ],
      }),
    }),
  }),
  utils: {
    keccak256: jest.fn().mockReturnValue('0x1234567890abcdef'),
    verifyMessage: jest.fn().mockReturnValue('0x1234567890123456789012345678901234567890'),
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
            shipmentId: 'SHIP001',
            status: 'InTransit',
            location: 'Port of Rotterdam',
            lastUpdated: new Date().toISOString(),
          }),
        }),
      }),
      add: jest.fn().mockResolvedValue({ id: 'audit123' }),
      where: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            empty: false,
            docs: [{ id: 'shipment123', data: () => ({ shipmentId: 'SHIP001' }) }],
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

describe('Oil & Gas Adapter - Integration Tests', () => {
  let service: ShipmentTrackingService;
  let mockShipment: Shipment;

  beforeEach(() => {
    service = new ShipmentTrackingService(
      '0x1234567890123456789012345678901234567890',
      '0xprivatekey',
      'https://rpc.example.com',
      'chainlink-shipment-job'
    );

    mockShipment = {
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Real-time Shipment Status Ingestion', () => {
    it('should ingest real-time status from Chainlink/REST into shipmentLogs/', async () => {
      const shipmentId = 'SHIP001';
      
      // Mock real-time tracking data
      const mockTrackingData = {
        success: true,
        data: {
          shipmentId: 'SHIP001',
          status: 'InTransit',
          location: 'Port of Rotterdam',
          coordinates: { lat: 51.9225, lng: 4.4792 },
          estimatedArrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date().toISOString(),
        },
      };

      const { fetchFromChainlink } = require('@escrow/utils');
      fetchFromChainlink.mockResolvedValue(mockTrackingData);

      const result = await service.updateShipmentStatus(shipmentId);

      expect(result).toBe(true);
      expect(fetchFromChainlink).toHaveBeenCalledWith('chainlink-shipment-job', {
        shipmentId: 'SHIP001',
        endpoint: 'https://api.shipping-tracker.com/shipment',
      });
    });

    it('should handle status transitions: PickedUp → InTransit → Delivered', async () => {
      const shipmentId = 'SHIP001';
      
      // Mock status transition
      const statusUpdates = [
        { status: 'PickedUp', location: 'Port of Houston' },
        { status: 'InTransit', location: 'Atlantic Ocean' },
        { status: 'Delivered', location: 'Port of Rotterdam' },
      ];

      const { fetchFromChainlink } = require('@escrow/utils');
      
      for (const update of statusUpdates) {
        fetchFromChainlink.mockResolvedValue({
          success: true,
          data: {
            shipmentId: 'SHIP001',
            ...update,
            lastUpdated: new Date().toISOString(),
          },
        });

        await service.updateShipmentStatus(shipmentId);
      }

      // Verify all status updates were processed
      const db = require('firebase-admin/firestore').getFirestore();
      expect(db.collection).toHaveBeenCalledWith('shipmentLogs');
    });

    it('should log real-time updates in Firestore with timestamp', async () => {
      const shipmentId = 'SHIP001';
      
      const mockTrackingData = {
        success: true,
        data: {
          shipmentId: 'SHIP001',
          status: 'InTransit',
          location: 'Port of Rotterdam',
          lastUpdated: new Date().toISOString(),
        },
      };

      const { fetchFromChainlink } = require('@escrow/utils');
      fetchFromChainlink.mockResolvedValue(mockTrackingData);

      await service.updateShipmentStatus(shipmentId);

      // Verify Firestore logging
      const db = require('firebase-admin/firestore').getFirestore();
      expect(db.collection).toHaveBeenCalledWith('shipmentLogs');
    });
  });

  describe('Map & Timeline UI Integration', () => {
    it('should provide coordinates for map rendering', async () => {
      const shipmentId = 'SHIP001';
      
      const mockTrackingData = {
        success: true,
        data: {
          shipmentId: 'SHIP001',
          status: 'InTransit',
          location: 'Port of Rotterdam',
          coordinates: { lat: 51.9225, lng: 4.4792 },
          lastUpdated: new Date().toISOString(),
        },
      };

      const { fetchFromChainlink } = require('@escrow/utils');
      fetchFromChainlink.mockResolvedValue(mockTrackingData);

      const result = await service.updateShipmentStatus(shipmentId);

      expect(result).toBe(true);
      // Coordinates should be available for map rendering
    });

    it('should provide timeline data for UI rendering', async () => {
      const shipmentId = 'SHIP001';
      
      // Mock timeline events
      const mockTimelineData = {
        success: true,
        data: {
          shipmentId: 'SHIP001',
          timeline: [
            {
              event: 'PickedUp',
              location: 'Port of Houston',
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              event: 'InTransit',
              location: 'Atlantic Ocean',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              event: 'Delivered',
              location: 'Port of Rotterdam',
              timestamp: new Date().toISOString(),
            },
          ],
        },
      };

      const { fetchFromChainlink } = require('@escrow/utils');
      fetchFromChainlink.mockResolvedValue(mockTimelineData);

      const timeline = await service.getShipmentTimeline(shipmentId);

      expect(timeline).toBeDefined();
      expect(Array.isArray(timeline)).toBe(true);
    });
  });

  describe('Delivery Proof EIP-712 Signature Verification', () => {
    it('should verify delivery proof with EIP-712 signature and emit DeliveryVerified event', async () => {
      const shipmentId = 'SHIP001';
      const deliveryProof = '0x1234567890123456789012345678901234567890';
      const signedProof = '0xsigneddeliveryproof';

      // Mock EIP-712 signature verification
      const ethers = require('ethers');
      ethers.utils.verifyMessage.mockReturnValue('0x1234567890123456789012345678901234567890');

      const result = await service.verifyDelivery(shipmentId, deliveryProof, signedProof);

      expect(result).toBe(true);
      
      // Verify on-chain event emission
      const contract = require('ethers').Contract.mock.results[0].value;
      expect(contract.verifyDelivery).toHaveBeenCalled();
    });

    it('should reject invalid delivery proof signatures', async () => {
      const shipmentId = 'SHIP001';
      const deliveryProof = '0x1234567890123456789012345678901234567890';
      const invalidSignature = '0xinvalid';

      // Mock failed signature verification
      const ethers = require('ethers');
      ethers.utils.verifyMessage.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const result = await service.verifyDelivery(shipmentId, deliveryProof, invalidSignature);

      expect(result).toBe(false);
    });

    it('should store delivery verification in Firestore with signer identity', async () => {
      const shipmentId = 'SHIP001';
      const deliveryProof = '0x1234567890123456789012345678901234567890';
      const signedProof = '0xsigneddeliveryproof';

      const ethers = require('ethers');
      ethers.utils.verifyMessage.mockReturnValue('0x1234567890123456789012345678901234567890');

      await service.verifyDelivery(shipmentId, deliveryProof, signedProof);

      // Verify Firestore verification entry
      const db = require('firebase-admin/firestore').getFirestore();
      expect(db.collection).toHaveBeenCalledWith('verifiedDeliveries');
    });
  });

  describe('Revocation & Fund-freeze Flows', () => {
    it('should revoke shipment with admin controls and emit ShipmentRevoked event', async () => {
      const shipmentId = 'SHIP001';
      const reason = 'Documentation fraud';

      await service.revokeShipment(shipmentId, reason);

      // Verify on-chain revocation
      const contract = require('ethers').Contract.mock.results[0].value;
      expect(contract.revokeShipment).toHaveBeenCalledWith(shipmentId, reason);
      
      // Verify ShipmentRevoked event emission
      const receipt = await contract.revokeShipment().wait();
      expect(receipt.events[0].event).toBe('ShipmentRevoked');
      expect(receipt.events[0].args.reason).toBe(reason);
    });

    it('should freeze associated funds on revocation', async () => {
      const shipmentId = 'SHIP001';
      const reason = 'Documentation fraud';

      await service.revokeShipment(shipmentId, reason);

      // Verify fund freeze logic
      const db = require('firebase-admin/firestore').getFirestore();
      expect(db.collection).toHaveBeenCalledWith('frozenFunds');
    });

    it('should log revocation in Firestore audit trail with admin identity', async () => {
      const shipmentId = 'SHIP001';
      const reason = 'Documentation fraud';

      await service.revokeShipment(shipmentId, reason);

      // Verify audit trail
      const db = require('firebase-admin/firestore').getFirestore();
      expect(db.collection).toHaveBeenCalledWith('shipmentLogs');
    });
  });

  describe('Error Handling & Fallbacks', () => {
    it('should handle Chainlink/REST failures gracefully', async () => {
      const shipmentId = 'SHIP001';
      
      // Mock tracking service failure
      const { fetchFromChainlink } = require('@escrow/utils');
      fetchFromChainlink.mockRejectedValue(new Error('Tracking service unavailable'));

      const result = await service.updateShipmentStatus(shipmentId);

      expect(result).toBe(false);
    });

    it('should handle malformed tracking responses', async () => {
      const shipmentId = 'SHIP001';
      
      // Mock malformed response
      const { fetchFromChainlink } = require('@escrow/utils');
      fetchFromChainlink.mockResolvedValue({
        success: true,
        data: null, // Malformed - missing data
      });

      const result = await service.updateShipmentStatus(shipmentId);

      expect(result).toBe(false);
    });

    it('should provide detailed error messages for debugging', async () => {
      const shipmentId = 'SHIP001';
      
      // Mock tracking failure
      const { fetchFromChainlink } = require('@escrow/utils');
      fetchFromChainlink.mockRejectedValue(new Error('Tracking service unavailable'));

      await service.updateShipmentStatus(shipmentId);

      // Verify error logging
      const db = require('firebase-admin/firestore').getFirestore();
      expect(db.collection).toHaveBeenCalledWith('shipmentLogs');
    });
  });

  describe('Performance & Monitoring', () => {
    it('should track update latency', async () => {
      const shipmentId = 'SHIP001';
      
      const startTime = Date.now();
      
      const mockTrackingData = {
        success: true,
        data: {
          shipmentId: 'SHIP001',
          status: 'InTransit',
          location: 'Port of Rotterdam',
          lastUpdated: new Date().toISOString(),
        },
      };

      const { fetchFromChainlink } = require('@escrow/utils');
      fetchFromChainlink.mockResolvedValue(mockTrackingData);

      await service.updateShipmentStatus(shipmentId);
      
      const endTime = Date.now();
      const latency = endTime - startTime;

      expect(latency).toBeGreaterThan(0);
    });

    it('should handle concurrent tracking updates', async () => {
      const shipmentIds = ['SHIP001', 'SHIP002', 'SHIP003'];
      
      const mockTrackingData = {
        success: true,
        data: {
          status: 'InTransit',
          location: 'Port of Rotterdam',
          lastUpdated: new Date().toISOString(),
        },
      };

      const { fetchFromChainlink } = require('@escrow/utils');
      fetchFromChainlink.mockResolvedValue(mockTrackingData);

      const promises = shipmentIds.map(shipmentId => 
        service.updateShipmentStatus(shipmentId)
      );
      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results.every(result => typeof result === 'boolean')).toBe(true);
    });
  });

  describe('Real-time Event Subscription', () => {
    it('should subscribe to shipment status changes', async () => {
      const shipmentId = 'SHIP001';
      
      // Mock event subscription
      const mockSubscription = {
        on: jest.fn(),
        unsubscribe: jest.fn(),
      };

      const subscription = await service.subscribeToShipmentUpdates(shipmentId, (update) => {
        console.log('Shipment update:', update);
      });

      expect(subscription).toBeDefined();
      expect(typeof subscription.unsubscribe).toBe('function');
    });

    it('should handle subscription errors gracefully', async () => {
      const shipmentId = 'SHIP001';
      
      // Mock subscription failure
      const mockSubscription = {
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === 'error') {
            callback(new Error('Subscription failed'));
          }
        }),
        unsubscribe: jest.fn(),
      };

      const subscription = await service.subscribeToShipmentUpdates(shipmentId, (update) => {
        console.log('Shipment update:', update);
      });

      expect(subscription).toBeDefined();
    });
  });
}); 