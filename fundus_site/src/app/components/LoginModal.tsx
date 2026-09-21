import { X, Mail, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUpClick?: () => void;
  onAdminLogin?: () => void;
}

export function LoginModal({ isOpen, onClose, onSignUpClick, onAdminLogin }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setEmail('');
    setPassword('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Admin credentials check
    if (email === 'x1c9' && password === 'x9c1') {
      handleClose();
      onAdminLogin?.();
      setIsLoading(false);
      return;
    }

    // Validate email format for regular users
    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Welcome back!');
        handleClose();
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-sm relative rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(10,10,10,0.96)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Red top accent */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #dc2626, #ef4444)' }} />

        <div className="p-8">
          <button onClick={handleClose} className="absolute top-5 right-5 text-gray-500 hover:text-white transition">
            <X size={20} />
          </button>

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-gray-500 text-sm">Sign in to your FundusEC account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', boxShadow: '0 4px 20px rgba(220,38,38,0.4)' }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => { handleClose(); onSignUpClick?.(); }}
              className="text-red-400 hover:text-red-300 transition font-medium"
            >
              Create one
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
