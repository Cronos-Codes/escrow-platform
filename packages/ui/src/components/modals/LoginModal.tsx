import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import GoldButton from '../../GoldButton';
import GoldInput from '../../GoldInput';
import { useTheme } from '../../theme';
// import { X } from 'lucide-react';

// TODO: Replace with actual toast import
// import { useToast } from '../../Toast';

// Animation config (extract to lib/motion.ts in future)
const modalMotion = {
  initial: { opacity: 0, scale: 0.95, y: 40 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, scale: 0.95, y: 40, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
};

export interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ open, onOpenChange, onSuccess }) => {
  const theme = useTheme();
  // TODO: Replace with useLogin from packages/auth/hooks/useLogin
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // TODO: Replace with useToast
  const showToast = (msg: string) => alert(msg);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with useLogin logic
      if (!email || !password) throw new Error('Email and password required');
      // Simulate login
      await new Promise((res) => setTimeout(res, 800));
      if (email !== 'user@example.com' || password !== 'password') {
        throw new Error('Invalid credentials');
      }
      showToast('Login successful!');
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Accessibility: focus trap, ESC to close handled by Radix
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <AnimatePresence>
          {open && (
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                aria-hidden="true"
              />
            </Dialog.Overlay>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {open && (
            <Dialog.Content asChild forceMount>
              <motion.div
                className="fixed z-50 left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-xl border border-gold/30 bg-white dark:bg-black/90 p-8 flex flex-col gap-6 focus:outline-none"
                {...modalMotion}
                role="dialog"
                aria-modal="true"
              >
                {/* Close button */}
                <Dialog.Close asChild>
                  <button
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gold/10 focus:outline-none focus:ring-2 focus:ring-gold"
                    aria-label="Close login modal"
                  >
                    {/* Simple SVG X icon */}
                    <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </Dialog.Close>
                {/* Title */}
                <Dialog.Title className="text-2xl font-bold text-gold text-center">Sign in to Escrow</Dialog.Title>
                {/* Form */}
                <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                  <GoldInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    required
                    autoFocus
                  />
                  <GoldInput
                    label="Password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    required
                  />
                  {error && (
                    <div className="text-error text-sm text-center mt-2">{error}</div>
                  )}
                  <GoldButton type="submit" loading={loading} className="w-full mt-2">
                    Login
                  </GoldButton>
                </form>
                {/* Links */}
                <div className="flex justify-between text-xs text-gold/80 mt-2">
                  <button type="button" className="hover:underline focus:underline focus:outline-none" onClick={() => showToast('Forgot Password (not implemented)')}>Forgot Password?</button>
                  <button type="button" className="hover:underline focus:underline focus:outline-none" onClick={() => showToast('Sign Up (not implemented)')}>Sign Up</button>
                </div>
              </motion.div>
            </Dialog.Content>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}; 