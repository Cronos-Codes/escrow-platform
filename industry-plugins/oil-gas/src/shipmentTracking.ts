import { ethers } from 'ethers';
import { 
  Shipment, 
  ShipmentStatus, 
  ShipmentTrackingRequest,
  DeliveryVerificationRequest,
  ShipmentRevocationRequest,
  SHIPMENT_EVENTS,
  ShipmentEventType
} from '@escrow/schemas';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { fetchFromChainlink } from '@escrow/utils';

// Initialize Firebase Admin
if (!initializeApp.length) {
  initializeApp();
}

const db = getFirestore();

interface ShipmentStatusUpdate {
  status: ShipmentStatus;
  timestamp: string;
  location?: string;
  notes?: string;
  eventType: ShipmentEventType;
}

interface OracleTrackingResponse {
  shipmentId: string;
  status: string;
  location: string;
  timestamp: string;
  estimatedDelivery: string;
  carrier: string;
  events: Array<{
    type: string;
    timestamp: string;
    location: string;
    description: string;
  }>;
}

interface DeliveryProof {
  shipmentId: string;
  signedHash: string;
  deliveredAt: string;
  deliveredBy: string;
  location: string;
  quantity: number;
  condition: string;
}

export class ShipmentTrackingService {
  private provider: ethers.providers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor(
    private contractAddress: string,
    private privateKey: string,
    rpcUrl: string,
    private chainlinkJobId: string
  ) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, this.provider);
    
    // ShipmentToken contract ABI
    const abi = [
      'function mintShipmentToken(address to, string memory shipmentId, string memory tokenURI) external returns (uint256)',
      'function revokeShipmentToken(uint256 tokenId, string memory reason) external',
      'function updateShipmentStatus(string memory shipmentId, string memory status) external',
      'event ShipmentUpdated(string indexed shipmentId, string status, uint256 timestamp)',
      'event DeliveryVerified(string indexed shipmentId, address indexed verifier)',
      'event ShipmentRevoked(string indexed shipmentId, string reason)',
    ];
    
    this.contract = new ethers.Contract(contractAddress, abi, wallet);
  }

  /**
   * Track shipment using Chainlink oracle
   */
  async trackShipment(shipmentId: string): Promise<ShipmentStatusUpdate> {
    try {
      // Validate input
      const validation = ShipmentTrackingRequest.parse({ shipmentId });
      
      // Fetch tracking data from Chainlink oracle
      const oracleData = await this.fetchTrackingFromOracle(shipmentId);
      
      if (!oracleData) {
        throw new Error('Failed to fetch tracking data from oracle');
      }

      // Parse and validate status
      const status = this.parseShipmentStatus(oracleData.status);
      const eventType = this.mapStatusToEventType(status);
      
      const statusUpdate: ShipmentStatusUpdate = {
        status,
        timestamp: oracleData.timestamp,
        location: oracleData.location,
        eventType,
      };

      // Update Firestore with real-time status
      await this.updateShipmentStatusInFirestore(shipmentId, statusUpdate);
      
      // Emit on-chain event
      await this.emitShipmentUpdateEvent(shipmentId, status, oracleData.timestamp);
      
      return statusUpdate;
      
    } catch (error) {
      console.error('Shipment tracking failed:', error);
      throw new Error(`Failed to track shipment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify delivery using signed proof
   */
  async verifyDelivery(shipmentId: string, signedProofHash: string): Promise<boolean> {
    try {
      // Validate input
      const validation = DeliveryVerificationRequest.parse({ shipmentId, signedProofHash });
      
      // Verify EIP-712 signature
      const isValidSignature = await this.verifyDeliverySignature(signedProofHash);
      
      if (!isValidSignature) {
        throw new Error('Invalid delivery signature');
      }
      
      // Get token ID for this shipment
      const tokenId = await this.getTokenIdFromShipmentId(shipmentId);
      if (!tokenId) {
        throw new Error('No token found for this shipment ID');
      }
      
      // Update verification status in Firestore
      await db.collection('verifiedShipments').doc(shipmentId).set({
        verified: true,
        verifiedAt: new Date(),
        signedProofHash,
        verifiedBy: 'notary', // In production, get from signature
        tokenId,
      });
      
      // Emit verification event
      await this.emitDeliveryVerificationEvent(shipmentId);
      
      return true;
      
    } catch (error) {
      console.error('Delivery verification failed:', error);
      return false;
    }
  }

  /**
   * Revoke shipment (admin only)
   */
  async revokeShipment(shipmentId: string, reason: string): Promise<void> {
    try {
      // Validate input
      const validation = ShipmentRevocationRequest.parse({ shipmentId, reason });
      
      // Get token ID for this shipment
      const tokenId = await this.getTokenIdFromShipmentId(shipmentId);
      if (!tokenId) {
        throw new Error('No token found for this shipment ID');
      }
      
      // Revoke token on-chain
      const revokeTx = await this.contract.revokeShipmentToken(tokenId, reason);
      await revokeTx.wait();
      
      // Update status in Firestore
      await db.collection('shipmentLogs').doc(shipmentId).update({
        status: 'cancelled',
        revokedAt: new Date(),
        revocationReason: reason,
        revokedBy: 'admin', // In production, get from transaction signer
      });
      
      // Emit revocation event
      await this.emitShipmentRevocationEvent(shipmentId, reason);
      
    } catch (error) {
      console.error('Shipment revocation failed:', error);
      throw new Error(`Failed to revoke shipment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mint shipment token
   */
  async mintShipmentToken(shipmentId: string, shipmentData: Shipment): Promise<string> {
    try {
      // Validate shipment data
      const validation = Shipment.parse(shipmentData);
      
      // Create token metadata
      const metadata = {
        name: `${shipmentData.batchType.toUpperCase()} Shipment - ${shipmentId}`,
        description: `Tokenized ${shipmentData.batchType} shipment from ${shipmentData.origin} to ${shipmentData.destination}`,
        image: shipmentData.trackingUrl,
        attributes: [
          { trait_type: 'Batch Type', value: shipmentData.batchType },
          { trait_type: 'Quantity', value: shipmentData.quantity },
          { trait_type: 'Origin', value: shipmentData.origin },
          { trait_type: 'Destination', value: shipmentData.destination },
          { trait_type: 'Carrier', value: shipmentData.carrier },
          { trait_type: 'Status', value: shipmentData.status },
        ],
        external_url: shipmentData.trackingUrl,
        shipment_id: shipmentId,
      };

      // Store metadata on IPFS
      const tokenUri = await this.storeMetadataOnIPFS(metadata);
      
      // Mint token
      const mintTx = await this.contract.mintShipmentToken(shipmentData.carrier, shipmentId, tokenUri);
      const receipt = await mintTx.wait();
      
      // Extract token ID
      const tokenId = this.extractTokenIdFromReceipt(receipt);
      
      // Store shipment mapping
      await this.storeShipmentMapping(tokenId, shipmentId, shipmentData);
      
      return tokenId;
      
    } catch (error) {
      console.error('Shipment token minting failed:', error);
      throw new Error(`Failed to mint shipment token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async fetchTrackingFromOracle(shipmentId: string): Promise<OracleTrackingResponse | null> {
    try {
      // Use Chainlink HTTP GET adapter for carrier tracking
      const params = {
        shipmentId: shipmentId,
        endpoint: 'https://api.carrier-tracking.com/shipment',
      };
      
      const response = await fetchFromChainlink(this.chainlinkJobId, params);
      
      if (!response || !response.data) {
        throw new Error('Invalid oracle response');
      }
      
      return response.data as OracleTrackingResponse;
      
    } catch (error) {
      console.error('Oracle tracking fetch failed:', error);
      
      // Fallback to cached data if available
      const cachedData = await this.getCachedTrackingData(shipmentId);
      if (cachedData) {
        console.log('Using cached tracking data as fallback');
        return cachedData;
      }
      
      return null;
    }
  }

  private parseShipmentStatus(status: string): ShipmentStatus {
    const statusMap: Record<string, ShipmentStatus> = {
      'pending': 'pending',
      'picked_up': 'picked_up',
      'in_transit': 'in_transit',
      'customs_clearance': 'customs_clearance',
      'delivered': 'delivered',
      'cancelled': 'cancelled',
      'delayed': 'delayed',
    };
    
    return statusMap[status] || 'pending';
  }

  private mapStatusToEventType(status: ShipmentStatus): ShipmentEventType {
    const eventMap: Record<ShipmentStatus, ShipmentEventType> = {
      'pending': SHIPMENT_EVENTS.PICKED_UP,
      'picked_up': SHIPMENT_EVENTS.PICKED_UP,
      'in_transit': SHIPMENT_EVENTS.IN_TRANSIT,
      'customs_clearance': SHIPMENT_EVENTS.CUSTOMS_CLEARANCE,
      'delivered': SHIPMENT_EVENTS.DELIVERED,
      'cancelled': SHIPMENT_EVENTS.CANCELLED,
      'delayed': SHIPMENT_EVENTS.DELAYED,
    };
    
    return eventMap[status];
  }

  private async updateShipmentStatusInFirestore(shipmentId: string, statusUpdate: ShipmentStatusUpdate): Promise<void> {
    await db.collection('shipmentLogs').doc(shipmentId).set({
      shipmentId,
      status: statusUpdate.status,
      timestamp: statusUpdate.timestamp,
      location: statusUpdate.location,
      eventType: statusUpdate.eventType,
      updatedAt: new Date(),
    }, { merge: true });
  }

  private async emitShipmentUpdateEvent(shipmentId: string, status: string, timestamp: string): Promise<void> {
    // In production, this would be done via smart contract
    console.log(`Shipment update event: ${shipmentId}, Status: ${status}, Time: ${timestamp}`);
  }

  private async emitDeliveryVerificationEvent(shipmentId: string): Promise<void> {
    // In production, this would be done via smart contract
    console.log(`Delivery verification event: ${shipmentId}`);
  }

  private async emitShipmentRevocationEvent(shipmentId: string, reason: string): Promise<void> {
    // In production, this would be done via smart contract
    console.log(`Shipment revocation event: ${shipmentId}, Reason: ${reason}`);
  }

  private async verifyDeliverySignature(signedProofHash: string): Promise<boolean> {
    // In production, implement EIP-712 signature verification
    // For now, return true for demonstration
    return true;
  }

  private async getTokenIdFromShipmentId(shipmentId: string): Promise<string | null> {
    const snapshot = await db.collection('shipmentMappings')
      .where('shipmentId', '==', shipmentId)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    return snapshot.docs[0].id;
  }

  private async storeShipmentMapping(tokenId: string, shipmentId: string, shipmentData: Shipment): Promise<void> {
    await db.collection('shipmentMappings').doc(tokenId).set({
      shipmentId,
      batchType: shipmentData.batchType,
      quantity: shipmentData.quantity,
      origin: shipmentData.origin,
      destination: shipmentData.destination,
      mintedAt: new Date(),
    });
  }

  private async getCachedTrackingData(shipmentId: string): Promise<OracleTrackingResponse | null> {
    try {
      const doc = await db.collection('shipmentLogs').doc(shipmentId).get();
      if (doc.exists && doc.data()?.oracleData) {
        return doc.data()?.oracleData as OracleTrackingResponse;
      }
      return null;
    } catch (error) {
      console.error('Failed to get cached tracking data:', error);
      return null;
    }
  }

  private async storeMetadataOnIPFS(metadata: any): Promise<string> {
    // In production, use IPFS client to store metadata
    const metadataHash = ethers.utils.keccak256(JSON.stringify(metadata));
    return `ipfs://${metadataHash}`;
  }

  private extractTokenIdFromReceipt(receipt: ethers.ContractReceipt): string {
    // In production, parse the mint event to get token ID
    return ethers.utils.keccak256(JSON.stringify(receipt)).slice(0, 10);
  }
} 