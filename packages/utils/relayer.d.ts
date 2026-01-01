import { ethers } from 'ethers';
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
export declare class PaymentRelayer {
    private config;
    private provider;
    constructor(config?: Partial<RelayerConfig>, provider?: ethers.Provider);
    /**
     * Relays a user operation to the bundler
     * @param userOp The user operation to relay
     * @returns Transaction receipt
     */
    relayUserOp(userOp: UserOperation): Promise<TransactionReceipt>;
    /**
     * Submits user operation to a bundler
     * @param userOp The user operation
     * @param bundlerUrl The bundler URL
     * @returns Bundler response
     */
    private submitToBundler;
    /**
     * Submits user operation directly to EntryPoint (fallback)
     * @param userOp The user operation
     * @returns Transaction receipt
     */
    private submitToEntryPoint;
    /**
     * Waits for a transaction to be mined
     * @param transactionHash The transaction hash
     * @returns Transaction receipt
     */
    private waitForTransaction;
    /**
     * Formats user operation for bundler submission
     * @param userOp The user operation
     * @returns Formatted user operation
     */
    private formatUserOpForBundler;
    /**
     * Sleep utility function
     * @param ms Milliseconds to sleep
     */
    private sleep;
    /**
     * Estimates gas for a user operation
     * @param userOp The user operation
     * @returns Gas estimate
     */
    estimateGas(userOp: UserOperation): Promise<string>;
    /**
     * Gets user operation status
     * @param userOpHash The user operation hash
     * @returns Operation status
     */
    getUserOpStatus(userOpHash: string): Promise<{
        status: 'pending' | 'mined' | 'failed';
        transactionHash?: string;
        error?: string;
    }>;
    /**
     * Gets supported entry points
     * @returns List of supported entry points
     */
    getSupportedEntryPoints(): Promise<string[]>;
}
/**
 * Creates a user operation from basic parameters
 * @param sender The sender address
 * @param callData The call data
 * @param paymasterAndData The paymaster data
 * @returns User operation
 */
export declare function createUserOperation(sender: string, callData: string, paymasterAndData?: string): UserOperation;
/**
 * Validates a user operation
 * @param userOp The user operation to validate
 * @returns Validation result
 */
export declare function validateUserOperation(userOp: UserOperation): {
    isValid: boolean;
    errors: string[];
};
export declare const paymentRelayer: PaymentRelayer;
