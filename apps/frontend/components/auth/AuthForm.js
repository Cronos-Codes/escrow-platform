import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePhoneOtp, useEmailOtp, useWalletLogin } from '@escrow/auth';
const AuthForm = ({ mode, type, onSuccess, onError }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const phoneOtp = usePhoneOtp();
    const emailOtp = useEmailOtp();
    const walletLogin = useWalletLogin();
    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        if (!showOtpInput) {
            await phoneOtp.sendOtp(phoneNumber);
            if (phoneOtp.state.success) {
                setShowOtpInput(true);
            }
            else if (phoneOtp.state.error) {
                onError(phoneOtp.state.error);
            }
        }
        else {
            const userCredential = await phoneOtp.verifyOtp(otpCode);
            if (userCredential) {
                onSuccess(userCredential.user);
            }
            else if (phoneOtp.state.error) {
                onError(phoneOtp.state.error);
            }
        }
    };
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!showOtpInput) {
            await emailOtp.sendEmailLink(email);
            if (emailOtp.state.success) {
                setShowOtpInput(true);
            }
            else if (emailOtp.state.error) {
                onError(emailOtp.state.error);
            }
        }
        else {
            const userCredential = await emailOtp.verifyEmailLink();
            if (userCredential) {
                onSuccess(userCredential.user);
            }
            else if (emailOtp.state.error) {
                onError(emailOtp.state.error);
            }
        }
    };
    const handleWalletSubmit = async (e) => {
        e.preventDefault();
        await walletLogin.connectWallet();
        if (walletLogin.state.success) {
            onSuccess({ walletAddress: walletLogin.state.walletAddress });
        }
        else if (walletLogin.state.error) {
            onError(walletLogin.state.error);
        }
    };
    const isPhoneLoading = phoneOtp.state.loading;
    const isEmailLoading = emailOtp.state.loading;
    const isWalletLoading = walletLogin.state.loading;
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "w-full max-w-md mx-auto", children: [type === 'phone' && (_jsxs(motion.form, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 }, onSubmit: handlePhoneSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "phone", className: "block text-sm font-medium text-gray-700 mb-1", children: "Phone Number" }), _jsx("input", { id: "phone", type: "tel", value: phoneNumber, onChange: (e) => setPhoneNumber(e.target.value), placeholder: "+1234567890", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", disabled: showOtpInput || isPhoneLoading, required: true })] }), showOtpInput && (_jsx(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, className: "space-y-4", children: _jsxs("div", { children: [_jsx("label", { htmlFor: "otp", className: "block text-sm font-medium text-gray-700 mb-1", children: "OTP Code" }), _jsx("input", { id: "otp", type: "text", value: otpCode, onChange: (e) => setOtpCode(e.target.value), placeholder: "123456", maxLength: 6, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", disabled: isPhoneLoading, required: true })] }) })), _jsx(motion.button, { type: "submit", disabled: isPhoneLoading, className: "w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed", whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: isPhoneLoading ? (_jsxs("span", { className: "flex items-center justify-center", children: [_jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 1, repeat: Infinity, ease: "linear" }, className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" }), showOtpInput ? 'Verifying...' : 'Sending OTP...'] })) : (showOtpInput ? 'Verify OTP' : 'Send OTP') })] }, "phone-form")), type === 'email' && (_jsxs(motion.form, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 }, onSubmit: handleEmailSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-1", children: "Email Address" }), _jsx("input", { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "user@example.com", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", disabled: showOtpInput || isEmailLoading, required: true })] }), showOtpInput && (_jsx(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, className: "p-4 bg-blue-50 rounded-md", children: _jsx("p", { className: "text-sm text-blue-800", children: "Check your email for a sign-in link. Click the link to complete authentication." }) })), _jsx(motion.button, { type: "submit", disabled: isEmailLoading || showOtpInput, className: "w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed", whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: isEmailLoading ? (_jsxs("span", { className: "flex items-center justify-center", children: [_jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 1, repeat: Infinity, ease: "linear" }, className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" }), "Sending Email..."] })) : ('Send Email Link') })] }, "email-form")), type === 'wallet' && (_jsxs(motion.form, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 }, onSubmit: handleWalletSubmit, className: "space-y-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center", children: _jsx("span", { className: "text-2xl", children: "\uD83D\uDD17" }) }), _jsx("p", { className: "text-gray-600 mb-4", children: "Connect your wallet to sign in securely" })] }), _jsx(motion.button, { type: "submit", disabled: isWalletLoading, className: "w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed", whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: isWalletLoading ? (_jsxs("span", { className: "flex items-center justify-center", children: [_jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 1, repeat: Infinity, ease: "linear" }, className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" }), "Connecting..."] })) : ('Connect Wallet') })] }, "wallet-form"))] }));
};
export default AuthForm;
