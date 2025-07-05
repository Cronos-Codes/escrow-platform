import { ethers } from 'ethers';
import { Property, DeedTokenizationRequest, PropertyVerificationRequest } from '@escrow/schemas';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!initializeApp.length) {
  initializeApp();
}

const db = getFirestore();

interface TokenMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url: string;
  provenance_hash: string;
  deal_id: string;
  property_id: string;
}

interface TokenizationResult {
  tokenId: string;
  tokenUri: string;
  contractAddress: string;
  provenanceHash: string;
}

export class DeedTokenizationService {
  private provider: ethers.providers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor(
    private contractAddress: string,
    private privateKey: string,
    rpcUrl: string
  ) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, this.provider);
    
    // RealEstateToken contract ABI (simplified for ERC-721 + custom functions)
    const abi = [
      'function mint(address to, string memory tokenURI) external returns (uint256)',
      'function tokenURI(uint256 tokenId) external view returns (string memory)',
      'function ownerOf(uint256 tokenId) external view returns (address)',
      'function revokePropertyToken(uint256 tokenId, string memory reason) external',
      'event TokenRevoked(uint256 indexed tokenId, string reason)',
      'event PropertyVerified(uint256 indexed tokenId, string indexed propertyId)',
    ];
    
    this.contract = new ethers.Contract(contractAddress, abi, wallet);
  }

  /**
   * Tokenize a property deed by minting an ERC-721 token
   */
  async tokenizeDeed(dealId: string, propertyData: Property): Promise<string> {
    try {
      // Validate property data
      const validation = Property.parse(propertyData);
      
      // Generate provenance hash
      const provenanceHash = this.generateProvenanceHash(propertyData);
      
      // Create token metadata
      const metadata: TokenMetadata = {
        name: `Property Deed - ${propertyData.location}`,
        description: `Tokenized property deed for ${propertyData.location}`,
        image: propertyData.documentUri,
        attributes: [
          { trait_type: 'Location', value: propertyData.location },
          { trait_type: 'Size (sq ft)', value: propertyData.size },
          { trait_type: 'Valuation (USD)', value: propertyData.valuation },
          { trait_type: 'Zoning', value: propertyData.zoning },
          { trait_type: 'Valuation Band', value: this.getValuationBand(propertyData.valuation) },
          { trait_type: 'Coordinates', value: `${propertyData.coordinates.lat},${propertyData.coordinates.lng}` },
        ],
        external_url: propertyData.documentUri,
        provenance_hash: provenanceHash,
        deal_id: dealId,
        property_id: propertyData.propertyId,
      };

      // Store metadata on IPFS (simulated - in production use IPFS client)
      const tokenUri = await this.storeMetadataOnIPFS(metadata);
      
      // Mint ERC-721 token
      const mintTx = await this.contract.mint(propertyData.owner, tokenUri);
      const receipt = await mintTx.wait();
      
      // Extract token ID from mint event
      const tokenId = this.extractTokenIdFromReceipt(receipt);
      
      // Store reverse mapping in Firestore
      await this.storeReverseMapping(tokenId, dealId, propertyData.propertyId);
      
      // Log tokenization
      await this.logTokenization(tokenId, dealId, propertyData, tokenUri, provenanceHash);
      
      return tokenId;
      
    } catch (error) {
      console.error('Deed tokenization failed:', error);
      throw new Error(`Failed to tokenize deed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify property deed using signed document hash
   */
  async verifyPropertyDeed(dealId: string, signedDocHash: string): Promise<boolean> {
    try {
      // Validate input
      const validation = PropertyVerificationRequest.parse({ dealId, signedDocHash });
      
      // Verify EIP-712 signature
      const isValidSignature = await this.verifyEIP712Signature(signedDocHash);
      
      if (!isValidSignature) {
        throw new Error('Invalid signature for property verification');
      }
      
      // Get token ID from deal ID mapping
      const tokenId = await this.getTokenIdFromDealId(dealId);
      if (!tokenId) {
        throw new Error('No token found for this deal ID');
      }
      
      // Update verification status in Firestore
      await db.collection('verifiedProperties').doc(dealId).set({
        verified: true,
        verifiedAt: new Date(),
        signedDocHash,
        verifiedBy: 'notary', // In production, get from signature
        tokenId,
      });
      
      // Emit verification event (would be done via smart contract in production)
      console.log(`Property verified: Deal ${dealId}, Token ${tokenId}`);
      
      return true;
      
    } catch (error) {
      console.error('Property verification failed:', error);
      return false;
    }
  }

  /**
   * Revoke a property token (admin/verifier only)
   */
  async revokePropertyToken(tokenId: string, reason: string): Promise<void> {
    try {
      const revokeTx = await this.contract.revokePropertyToken(tokenId, reason);
      await revokeTx.wait();
      
      // Log revocation in Firestore
      await db.collection('revokedTokens').doc(tokenId).set({
        revokedAt: new Date(),
        reason,
        revokedBy: 'admin', // In production, get from transaction signer
      });
      
    } catch (error) {
      console.error('Token revocation failed:', error);
      throw new Error(`Failed to revoke token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateProvenanceHash(propertyData: Property): string {
    const encodedData = ethers.utils.defaultAbiCoder.encode(
      ['string', 'address', 'string', 'uint256', 'uint256', 'string'],
      [
        propertyData.propertyId,
        propertyData.owner,
        propertyData.location,
        propertyData.size,
        propertyData.valuation,
        propertyData.zoning,
      ]
    );
    return ethers.utils.keccak256(encodedData);
  }

  private getValuationBand(valuation: number): string {
    if (valuation < 100000) return 'Under $100k';
    if (valuation < 500000) return '$100k - $500k';
    if (valuation < 1000000) return '$500k - $1M';
    if (valuation < 5000000) return '$1M - $5M';
    return 'Over $5M';
  }

  private async storeMetadataOnIPFS(metadata: TokenMetadata): Promise<string> {
    // In production, use IPFS client to store metadata
    // For now, simulate IPFS storage with a mock URI
    const metadataHash = ethers.utils.keccak256(JSON.stringify(metadata));
    return `ipfs://${metadataHash}`;
  }

  private extractTokenIdFromReceipt(receipt: ethers.ContractReceipt): string {
    // In production, parse the mint event to get token ID
    // For now, return a mock token ID
    return ethers.utils.keccak256(JSON.stringify(receipt)).slice(0, 10);
  }

  private async storeReverseMapping(tokenId: string, dealId: string, propertyId: string): Promise<void> {
    await db.collection('tokenMappings').doc(tokenId).set({
      dealId,
      propertyId,
      createdAt: new Date(),
    });
  }

  private async logTokenization(
    tokenId: string, 
    dealId: string, 
    propertyData: Property, 
    tokenUri: string, 
    provenanceHash: string
  ): Promise<void> {
    await db.collection('tokenizationLogs').add({
      tokenId,
      dealId,
      propertyId: propertyData.propertyId,
      tokenUri,
      provenanceHash,
      mintedAt: new Date(),
      owner: propertyData.owner,
      location: propertyData.location,
      valuation: propertyData.valuation,
    });
  }

  private async verifyEIP712Signature(signedDocHash: string): Promise<boolean> {
    // In production, implement EIP-712 signature verification
    // For now, return true for demonstration
    return true;
  }

  private async getTokenIdFromDealId(dealId: string): Promise<string | null> {
    const snapshot = await db.collection('tokenMappings')
      .where('dealId', '==', dealId)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    return snapshot.docs[0].id;
  }
} 