import { ethers } from 'ethers';
import { 
  Assay, 
  AssayVerificationRequest, 
  BatchRevocationRequest,
  METAL_PURITY_THRESHOLDS,
  MetalType 
} from '@escrow/schemas';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { fetchFromChainlink } from '@escrow/utils';

// Initialize Firebase Admin
if (!initializeApp.length) {
  initializeApp();
}

const db = getFirestore();

interface OracleResponse {
  batchId: string;
  metalType: string;
  purity: number;
  weight: number;
  assayer: string;
  certificateUri: string;
  origin: string;
  timestamp: string;
  verified: boolean;
}

interface AssayVerificationResult {
  verified: boolean;
  reason?: string;
  oracleData?: OracleResponse;
  purityThreshold: number;
  meetsThreshold: boolean;
}

export class MetalShipmentService {
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
    
    // MetalsToken contract ABI
    const abi = [
      'function mintMetalBatch(address to, string memory batchId, string memory tokenURI) external returns (uint256)',
      'function revokeMetalToken(uint256 tokenId, string memory reason) external',
      'event AssayVerified(string indexed batchId, string metalType, bool verified)',
      'event BatchRevoked(string indexed batchId, string reason)',
    ];
    
    this.contract = new ethers.Contract(contractAddress, abi, wallet);
  }

  /**
   * Verify assay using Chainlink oracle
   */
  async verifyAssay(batchId: string): Promise<boolean> {
    try {
      // Validate input
      const validation = AssayVerificationRequest.parse({ batchId });
      
      // Fetch assay data from Chainlink oracle
      const oracleData = await this.fetchAssayFromOracle(batchId);
      
      if (!oracleData) {
        throw new Error('Failed to fetch assay data from oracle');
      }

      // Validate oracle response against schema
      const assayData = Assay.parse(oracleData);
      
      // Check purity threshold
      const purityThreshold = METAL_PURITY_THRESHOLDS[assayData.metalType as MetalType];
      const meetsThreshold = assayData.purity >= purityThreshold;
      
      // Verify certificate URI hash
      const certificateValid = await this.verifyCertificateHash(assayData.certificateUri);
      
      const verificationResult: AssayVerificationResult = {
        verified: meetsThreshold && certificateValid,
        reason: !meetsThreshold ? `Purity ${assayData.purity}% below threshold ${purityThreshold}%` : 
                !certificateValid ? 'Invalid certificate hash' : undefined,
        oracleData,
        purityThreshold,
        meetsThreshold,
      };

      // Log verification to Firestore
      await this.logAssayVerification(batchId, verificationResult);
      
      // Emit on-chain event
      await this.emitAssayVerificationEvent(batchId, assayData.metalType, verificationResult.verified);
      
      return verificationResult.verified;
      
    } catch (error) {
      console.error('Assay verification failed:', error);
      
      // Log failed verification
      await this.logAssayVerification(batchId, {
        verified: false,
        reason: error instanceof Error ? error.message : 'Unknown error',
        purityThreshold: 0,
        meetsThreshold: false,
      });
      
      return false;
    }
  }

  /**
   * Revoke a verified batch
   */
  async revokeBatch(batchId: string, reason: string): Promise<void> {
    try {
      // Validate input
      const validation = BatchRevocationRequest.parse({ batchId, reason });
      
      // Get token ID for this batch
      const tokenId = await this.getTokenIdFromBatchId(batchId);
      if (!tokenId) {
        throw new Error('No token found for this batch ID');
      }
      
      // Revoke token on-chain
      const revokeTx = await this.contract.revokeMetalToken(tokenId, reason);
      await revokeTx.wait();
      
      // Update verification status in Firestore
      await db.collection('assayLogs').doc(batchId).update({
        verified: false,
        revokedAt: new Date(),
        revocationReason: reason,
        revokedBy: 'admin', // In production, get from transaction signer
      });
      
      // Emit revocation event
      await this.emitBatchRevocationEvent(batchId, reason);
      
    } catch (error) {
      console.error('Batch revocation failed:', error);
      throw new Error(`Failed to revoke batch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mint metal batch token
   */
  async mintMetalBatch(batchId: string, assayData: Assay): Promise<string> {
    try {
      // Validate assay data
      const validation = Assay.parse(assayData);
      
      // Create token metadata
      const metadata = {
        name: `${assayData.metalType.toUpperCase()} Batch - ${batchId}`,
        description: `Tokenized ${assayData.metalType} batch with ${assayData.purity}% purity`,
        image: assayData.certificateUri,
        attributes: [
          { trait_type: 'Metal Type', value: assayData.metalType },
          { trait_type: 'Purity (%)', value: assayData.purity },
          { trait_type: 'Weight (g)', value: assayData.weight },
          { trait_type: 'Origin', value: assayData.origin },
          { trait_type: 'Assayer', value: assayData.assayer },
          { trait_type: 'Purity Grade', value: this.getPurityGrade(assayData.purity) },
        ],
        external_url: assayData.certificateUri,
        batch_id: batchId,
      };

      // Store metadata on IPFS
      const tokenUri = await this.storeMetadataOnIPFS(metadata);
      
      // Mint token
      const mintTx = await this.contract.mintMetalBatch(assayData.assayer, batchId, tokenUri);
      const receipt = await mintTx.wait();
      
      // Extract token ID
      const tokenId = this.extractTokenIdFromReceipt(receipt);
      
      // Store batch mapping
      await this.storeBatchMapping(tokenId, batchId, assayData);
      
      return tokenId;
      
    } catch (error) {
      console.error('Metal batch minting failed:', error);
      throw new Error(`Failed to mint metal batch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async fetchAssayFromOracle(batchId: string): Promise<OracleResponse | null> {
    try {
      // Use Chainlink HTTP GET adapter
      const params = {
        batchId: batchId,
        endpoint: 'https://api.assay-verification.com/batch',
      };
      
      const response = await fetchFromChainlink(this.chainlinkJobId, params);
      
      if (!response || !response.data) {
        throw new Error('Invalid oracle response');
      }
      
      return response.data as OracleResponse;
      
    } catch (error) {
      console.error('Oracle fetch failed:', error);
      
      // Fallback to cached data if available
      const cachedData = await this.getCachedAssayData(batchId);
      if (cachedData) {
        console.log('Using cached assay data as fallback');
        return cachedData;
      }
      
      return null;
    }
  }

  private async verifyCertificateHash(certificateUri: string): Promise<boolean> {
    try {
      // In production, verify the certificate hash against a trusted registry
      // For now, simulate verification
      const response = await fetch(certificateUri);
      if (!response.ok) {
        return false;
      }
      
      const content = await response.text();
      const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(content));
      
      // Check against known good hashes (in production, use a registry)
      return hash.length === 66; // Valid hash format
      
    } catch (error) {
      console.error('Certificate verification failed:', error);
      return false;
    }
  }

  private async logAssayVerification(batchId: string, result: AssayVerificationResult): Promise<void> {
    await db.collection('assayLogs').doc(batchId).set({
      batchId,
      verified: result.verified,
      reason: result.reason,
      oracleData: result.oracleData,
      purityThreshold: result.purityThreshold,
      meetsThreshold: result.meetsThreshold,
      verifiedAt: new Date(),
      verifiedBy: 'oracle', // In production, get from oracle response
    }, { merge: true });
  }

  private async emitAssayVerificationEvent(batchId: string, metalType: string, verified: boolean): Promise<void> {
    // In production, this would be done via smart contract
    console.log(`Assay verification event: Batch ${batchId}, Metal ${metalType}, Verified ${verified}`);
  }

  private async emitBatchRevocationEvent(batchId: string, reason: string): Promise<void> {
    // In production, this would be done via smart contract
    console.log(`Batch revocation event: Batch ${batchId}, Reason ${reason}`);
  }

  private getPurityGrade(purity: number): string {
    if (purity >= 99.99) return 'Ultra High Purity';
    if (purity >= 99.9) return 'High Purity';
    if (purity >= 99.5) return 'Standard Purity';
    if (purity >= 99.0) return 'Commercial Purity';
    return 'Low Purity';
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

  private async storeBatchMapping(tokenId: string, batchId: string, assayData: Assay): Promise<void> {
    await db.collection('batchMappings').doc(tokenId).set({
      batchId,
      metalType: assayData.metalType,
      purity: assayData.purity,
      weight: assayData.weight,
      mintedAt: new Date(),
    });
  }

  private async getTokenIdFromBatchId(batchId: string): Promise<string | null> {
    const snapshot = await db.collection('batchMappings')
      .where('batchId', '==', batchId)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    return snapshot.docs[0].id;
  }

  private async getCachedAssayData(batchId: string): Promise<OracleResponse | null> {
    try {
      const doc = await db.collection('assayLogs').doc(batchId).get();
      if (doc.exists && doc.data()?.oracleData) {
        return doc.data()?.oracleData as OracleResponse;
      }
      return null;
    } catch (error) {
      console.error('Failed to get cached assay data:', error);
      return null;
    }
  }
} 