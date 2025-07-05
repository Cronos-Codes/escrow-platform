import { ethers } from 'ethers';

interface OracleRequest {
  jobId: string;
  params: Record<string, any>;
  callback?: string;
  data?: string;
}

interface OracleResponse {
  success: boolean;
  data?: any;
  error?: string;
  requestId?: string;
  timestamp: number;
}

interface OracleSubscription {
  contractAddress: string;
  eventName: string;
  callback: (event: any) => void;
  filter?: any;
}

export class OracleService {
  private provider: ethers.providers.JsonRpcProvider;
  private subscriptions: Map<string, OracleSubscription> = new Map();
  private retryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
  };

  constructor(
    private rpcUrl: string,
    private chainlinkNodeUrl: string,
    private chainlinkAccessKey?: string
  ) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  /**
   * Fetch data from Chainlink oracle
   */
  async fetchFromChainlink(jobId: string, params: any): Promise<OracleResponse> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const response = await this.makeChainlinkRequest(jobId, params);
        
        if (response.success) {
          return response;
        }
        
        throw new Error(response.error || 'Oracle request failed');
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === this.retryConfig.maxRetries) {
          break;
        }
        
        // Exponential backoff with jitter
        const delay = this.calculateBackoffDelay(attempt);
        await this.sleep(delay);
      }
    }
    
    throw new Error(`Oracle request failed after ${this.retryConfig.maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Subscribe to oracle events
   */
  subscribeOracleEvents(
    contractAddress: string,
    eventName: string,
    callback: (event: any) => void,
    filter?: any
  ): string {
    const subscriptionId = `${contractAddress}-${eventName}-${Date.now()}`;
    
    const subscription: OracleSubscription = {
      contractAddress,
      eventName,
      callback,
      filter,
    };
    
    this.subscriptions.set(subscriptionId, subscription);
    
    // Set up event listener
    this.setupEventListener(subscriptionId, subscription);
    
    return subscriptionId;
  }

  /**
   * Unsubscribe from oracle events
   */
  unsubscribeOracleEvents(subscriptionId: string): boolean {
    return this.subscriptions.delete(subscriptionId);
  }

  /**
   * Get all active subscriptions
   */
  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Update retry configuration
   */
  updateRetryConfig(config: Partial<typeof this.retryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
  }

  private async makeChainlinkRequest(jobId: string, params: any): Promise<OracleResponse> {
    const request: OracleRequest = {
      jobId,
      params,
      callback: this.chainlinkAccessKey ? `${this.chainlinkNodeUrl}/callback` : undefined,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.chainlinkAccessKey) {
      headers['Authorization'] = `Bearer ${this.chainlinkAccessKey}`;
    }

    const response = await fetch(`${this.chainlinkNodeUrl}/jobs/${jobId}/runs`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: data.success || false,
      data: data.data,
      error: data.error,
      requestId: data.requestId,
      timestamp: Date.now(),
    };
  }

  private calculateBackoffDelay(attempt: number): number {
    const exponentialDelay = this.retryConfig.baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
    const delay = exponentialDelay + jitter;
    
    return Math.min(delay, this.retryConfig.maxDelay);
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private setupEventListener(subscriptionId: string, subscription: OracleSubscription): void {
    try {
             const contract = new ethers.Contract(
         subscription.contractAddress,
        ['event OracleRequest(bytes32 indexed requestId, address indexed requester, uint256 payment, bytes4 indexed callbackFunctionId, uint256 cancelExpiration, uint256 dataVersion, bytes data)'],
        this.provider
      );

      const eventFilter = contract.filters.OracleRequest();
      
      contract.on(eventFilter, (requestId, requester, payment, callbackFunctionId, cancelExpiration, dataVersion, data) => {
        // Process the oracle request event
        const eventData = {
          requestId,
          requester,
          payment: payment.toString(),
          callbackFunctionId,
          cancelExpiration: cancelExpiration.toString(),
          dataVersion: dataVersion.toString(),
          data,
          timestamp: Date.now(),
        };
        
        subscription.callback(eventData);
      });

    } catch (error) {
      console.error(`Failed to setup event listener for subscription ${subscriptionId}:`, error);
    }
  }
}

// Convenience function for backward compatibility
export async function fetchFromChainlink(jobId: string, params: any): Promise<OracleResponse> {
  const oracleService = new OracleService(
    process.env.RPC_URL || 'https://mainnet.infura.io/v3/your-project-id',
    process.env.CHAINLINK_NODE_URL || 'https://chainlink-node.example.com',
    process.env.CHAINLINK_ACCESS_KEY
  );
  
  return oracleService.fetchFromChainlink(jobId, params);
}

// Event subscription convenience function
export function subscribeOracleEvents(
  contractAddress: string,
  eventName: string,
  callback: (event: any) => void
): string {
  const oracleService = new OracleService(
    process.env.RPC_URL || 'https://mainnet.infura.io/v3/your-project-id',
    process.env.CHAINLINK_NODE_URL || 'https://chainlink-node.example.com',
    process.env.CHAINLINK_ACCESS_KEY
  );
  
  return oracleService.subscribeOracleEvents(contractAddress, eventName, callback);
} 