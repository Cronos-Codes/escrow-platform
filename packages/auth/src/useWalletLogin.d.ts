export interface WalletLoginState {
    loading: boolean;
    error: string | null;
    success: boolean;
    walletAddress: string | null;
    isConnected: boolean;
}
export interface WalletLoginResult {
    state: WalletLoginState;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    reset: () => void;
}
export declare const useWalletLogin: () => WalletLoginResult;
