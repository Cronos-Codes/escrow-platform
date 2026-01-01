import { useState, useCallback } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from './firebase-config';
export const useEmailVerification = () => {
    const [state, setState] = useState({
        loading: false,
        error: null,
        success: false,
        isVerified: false,
    });
    const sendVerificationEmail = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            const user = auth.currentUser;
            if (!user || !user.email) {
                throw new Error('No authenticated user with email found');
            }
            // Send verification email
            await sendEmailVerification(user, {
                url: `${window.location.origin}/profile/complete`,
                handleCodeInApp: true,
            });
            setState(prev => ({
                ...prev,
                loading: false,
                success: true,
            }));
        }
        catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to send verification email',
            }));
        }
    }, []);
    const checkVerificationStatus = useCallback(async () => {
        try {
            const user = auth.currentUser;
            if (!user)
                return false;
            // Reload user to get latest verification status
            await user.reload();
            const isVerified = user.emailVerified;
            setState(prev => ({
                ...prev,
                isVerified,
            }));
            return isVerified;
        }
        catch (error) {
            console.error('Failed to check verification status:', error);
            return false;
        }
    }, []);
    return {
        state,
        sendVerificationEmail,
        checkVerificationStatus,
    };
};
