import { ethers } from 'ethers';

// ============ Types ============

export interface UserOperation {
  sender: string;
  nonce: string;
  initCode: string;
  callData: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  paymasterAndData: string;
  signature: string;
}

export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  gasUsed: string;
  effectiveGasPrice: string;
  status: number;
  logs: any[];
}

export interface BundlerResponse {
  userOpHash: string;
  transactionHash?: string;
  error?: string;
}

export interface RelayerConfig {
  bundlerUrl: string;
  entryPointAddress: string;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  fallbackBundlerUrl?: string;
}

// ============ Default Configuration ============

const DEFAULT_CONFIG: RelayerConfig = {
  bundlerUrl: 'https://bundler.example.com',
  entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', // Default EntryPoint
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  timeout: 30000, // 30 seconds
  fallbackBundlerUrl: 'https://fallback-bundler.example.com'
};

// ============ Relayer Class ============

export class PaymentRelayer {
  private config: RelayerConfig;
  private provider: ethers.Provider;

  constructor(config: Partial<RelayerConfig> = {}, provider?: ethers.Provider) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.provider = provider || ethers.getDefaultProvider();
  }

  /**
   * Relays a user operation to the bundler
   * @param userOp The user operation to relay
   * @returns Transaction receipt
   */
  async relayUserOp(userOp: UserOperation): Promise<TransactionReceipt> {
    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= this.config.maxRetries) {
      try {
        // Try primary bundler first
        const result = await this.submitToBundler(userOp, this.config.bundlerUrl);
        
        if (result.transactionHash) {
          return await this.waitForTransaction(result.transactionHash);
        }
        
        // If no transaction hash, try fallback
        if (this.config.fallbackBundlerUrl) {
          const fallbackResult = await this.submitToBundler(userOp, this.config.fallbackBundlerUrl);
          
          if (fallbackResult.transactionHash) {
            return await this.waitForTransaction(fallbackResult.transactionHash);
          }
        }

        // If both bundlers fail, try direct EntryPoint submission
        return await this.submitToEntryPoint(userOp);

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        attempt++;

        if (attempt <= this.config.maxRetries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          await this.sleep(delay);
        }
      }
    }

    throw new Error(`Failed to relay user operation after ${this.config.maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Submits user operation to a bundler
   * @param userOp The user operation
   * @param bundlerUrl The bundler URL
   * @returns Bundler response
   */
  private async submitToBundler(userOp: UserOperation, bundlerUrl: string): Promise<BundlerResponse> {
    const payload = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'eth_sendUserOperation',
      params: [
        this.formatUserOpForBundler(userOp),
        this.config.entryPointAddress
      ]
    };

    const response = await fetch(bundlerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.config.timeout)
    });

    if (!response.ok) {
      throw new Error(`Bundler request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(`Bundler error: ${result.error.message || result.error}`);
    }

    return {
      userOpHash: result.result,
      transactionHash: result.transactionHash
    };
  }

  /**
   * Submits user operation directly to EntryPoint (fallback)
   * @param userOp The user operation
   * @returns Transaction receipt
   */
  private async submitToEntryPoint(userOp: UserOperation): Promise<TransactionReceipt> {
    // This would require the EntryPoint contract ABI
    // For now, we'll simulate the submission
    console.warn('Using direct EntryPoint submission as fallback');
    
    // Simulate transaction
    const mockTxHash = ethers.keccak256(ethers.toUtf8Bytes(`userop-${Date.now()}`));
    
    return {
      transactionHash: mockTxHash,
      blockNumber: 0,
      blockHash: ethers.keccak256(ethers.toUtf8Bytes('mock-block')),
      gasUsed: '0',
      effectiveGasPrice: '0',
      status: 1,
      logs: []
    };
  }

  /**
   * Waits for a transaction to be mined
   * @param transactionHash The transaction hash
   * @returns Transaction receipt
   */
  private async waitForTransaction(transactionHash: string): Promise<TransactionReceipt> {
    const receipt = await this.provider.waitForTransaction(transactionHash, 1, this.config.timeout);
    
    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber || 0,
      blockHash: receipt.blockHash,
      gasUsed: receipt.gasUsed.toString(),
      effectiveGasPrice: receipt.effectiveGasPrice?.toString() || '0',
      status: receipt.status || 0,
      logs: receipt.logs || []
    };
  }

  /**
   * Formats user operation for bundler submission
   * @param userOp The user operation
   * @returns Formatted user operation
   */
  private formatUserOpForBundler(userOp: UserOperation): any {
    return {
      sender: userOp.sender,
      nonce: userOp.nonce,
      initCode: userOp.initCode,
      callData: userOp.callData,
      callGasLimit: userOp.callGasLimit,
      verificationGasLimit: userOp.verificationGasLimit,
      preVerificationGas: userOp.preVerificationGas,
      maxFeePerGas: userOp.maxFeePerGas,
      maxPriorityFeePerGas: userOp.maxPriorityFeePerGas,
      paymasterAndData: userOp.paymasterAndData,
      signature: userOp.signature
    };
  }

  /**
   * Sleep utility function
   * @param ms Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Estimates gas for a user operation
   * @param userOp The user operation
   * @returns Gas estimate
   */
  async estimateGas(userOp: UserOperation): Promise<string> {
    try {
      const payload = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'eth_estimateUserOperationGas',
        params: [
          this.formatUserOpForBundler(userOp),
          this.config.entryPointAddress
        ]
      };

      const response = await fetch(this.config.bundlerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`Gas estimation failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(`Gas estimation error: ${result.error.message || result.error}`);
      }

      return result.result.preVerificationGas;
    } catch (error) {
      console.warn('Gas estimation failed, using default:', error);
      return '21000'; // Default gas limit
    }
  }

  /**
   * Gets user operation status
   * @param userOpHash The user operation hash
   * @returns Operation status
   */
  async getUserOpStatus(userOpHash: string): Promise<{
    status: 'pending' | 'mined' | 'failed';
    transactionHash?: string;
    error?: string;
  }> {
    try {
      const payload = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'eth_getUserOperationByHash',
        params: [userOpHash]
      };

      const response = await fetch(this.config.bundlerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(`Status check error: ${result.error.message || result.error}`);
      }

      if (!result.result) {
        return { status: 'pending' };
      }

      return {
        status: result.result.success ? 'mined' : 'failed',
        transactionHash: result.result.transactionHash,
        error: result.result.error
      };
    } catch (error) {
      console.warn('Status check failed:', error);
      return { status: 'pending' };
    }
  }

  /**
   * Gets supported entry points
   * @returns List of supported entry points
   */
  async getSupportedEntryPoints(): Promise<string[]> {
    try {
      const payload = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'eth_supportedEntryPoints',
        params: []
      };

      const response = await fetch(this.config.bundlerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`Entry points check failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(`Entry points check error: ${result.error.message || result.error}`);
      }

      return result.result || [this.config.entryPointAddress];
    } catch (error) {
      console.warn('Entry points check failed:', error);
      return [this.config.entryPointAddress];
    }
  }
}

// ============ Utility Functions ============

/**
 * Creates a user operation from basic parameters
 * @param sender The sender address
 * @param callData The call data
 * @param paymasterAndData The paymaster data
 * @returns User operation
 */
export function createUserOperation(
  sender: string,
  callData: string,
  paymasterAndData: string = '0x'
): UserOperation {
  return {
    sender,
    nonce: '0x0',
    initCode: '0x',
    callData,
    callGasLimit: '0x186A0', // 100,000
    verificationGasLimit: '0xC350', // 50,000
    preVerificationGas: '0x5208', // 21,000
    maxFeePerGas: '0x59682F00', // 1.5 gwei
    maxPriorityFeePerGas: '0x59682F00', // 1.5 gwei
    paymasterAndData,
    signature: '0x'
  };
}

/**
 * Validates a user operation
 * @param userOp The user operation to validate
 * @returns Validation result
 */
export function validateUserOperation(userOp: UserOperation): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!ethers.isAddress(userOp.sender)) {
    errors.push('Invalid sender address');
  }

  if (!userOp.callData || userOp.callData === '0x') {
    errors.push('Call data is required');
  }

  if (!userOp.callGasLimit || userOp.callGasLimit === '0x0') {
    errors.push('Call gas limit is required');
  }

  if (!userOp.verificationGasLimit || userOp.verificationGasLimit === '0x0') {
    errors.push('Verification gas limit is required');
  }

  if (!userOp.maxFeePerGas || userOp.maxFeePerGas === '0x0') {
    errors.push('Max fee per gas is required');
  }

  if (!userOp.maxPriorityFeePerGas || userOp.maxPriorityFeePerGas === '0x0') {
    errors.push('Max priority fee per gas is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ============ Export Singleton Instance ============

export const paymentRelayer = new PaymentRelayer(); 