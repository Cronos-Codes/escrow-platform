import { useState, useEffect } from 'react';
import { useAuth } from './index';
export function useKycStatus() {
    const { user } = useAuth();
    const [kycStatus, setKycStatus] = useState('unverified');
    useEffect(() => {
        if (user?.kycStatus) {
            setKycStatus(user.kycStatus);
        }
    }, [user]);
    return { kycStatus };
}
