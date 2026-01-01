export interface TrustedDevice {
    id: string;
    name: string;
    type: 'mobile' | 'desktop' | 'tablet';
    browser: string;
    os: string;
    ipAddress: string;
    lastUsed: Date;
    isCurrent: boolean;
}
export interface TrustedDevicesState {
    loading: boolean;
    error: string | null;
    devices: TrustedDevice[];
    currentDevice: TrustedDevice | null;
}
export interface TrustedDevicesResult {
    state: TrustedDevicesState;
    getDevices: () => Promise<void>;
    addDevice: (deviceInfo: Partial<TrustedDevice>) => Promise<void>;
    removeDevice: (deviceId: string) => Promise<void>;
    trustCurrentDevice: () => Promise<void>;
}
export declare const useTrustedDevices: () => TrustedDevicesResult;
