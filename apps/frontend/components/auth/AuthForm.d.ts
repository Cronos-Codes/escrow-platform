import React from 'react';
interface AuthFormProps {
    mode: 'login' | 'signup';
    type: 'email' | 'phone' | 'wallet';
    onSuccess: (user: any) => void;
    onError: (error: string) => void;
}
declare const AuthForm: React.FC<AuthFormProps>;
export default AuthForm;
