import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../utils/axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResetPassword() {
  const [step, setStep] = useState('verify'); // 'verify' or 'reset'
  const [resetToken, setResetToken] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const verifyForm = useForm();
  const resetForm = useForm();

  // Get email from location state or URL params
  useEffect(() => {
    const emailFromState = location.state?.email;
    const urlParams = new URLSearchParams(location.search);
    const emailFromUrl = urlParams.get('email');
    
    if (emailFromState) {
      setEmail(emailFromState);
      verifyForm.setValue('email', emailFromState);
    } else if (emailFromUrl) {
      setEmail(emailFromUrl);
      verifyForm.setValue('email', emailFromUrl);
    }

    // Check if token is in URL (from email link)
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      setResetToken(tokenFromUrl);
      setStep('reset');
    }
  }, [location, verifyForm]);

  const onVerifyOTP = async (data) => {
    try {
      setLoading(true);
      setError('');
      setSuccess(false);
      
      const response = await api.post('/auth/verify-otp', {
        email: data.email.toLowerCase().trim(),
        code: data.code.trim()
      });
      
      setResetToken(response.data.resetToken);
      setEmail(data.email.toLowerCase().trim());
      setStep('reset');
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess(false);
      
      await api.post('/auth/reset-password', {
        resetToken,
        newPassword: data.newPassword
      });
      
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Password reset successfully! Please login with your new password.' }
        });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 lg:p-8 max-w-md mx-auto w-full border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-2xl lg:text-3xl font-semibold mb-6 text-gray-900 dark:text-white">
          {step === 'verify' ? 'Verify Code' : 'Reset Password'}
        </h2>
        
        <AnimatePresence mode="wait">
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg text-green-700 dark:text-green-400 text-sm"
            >
              {step === 'verify' 
                ? 'Code verified! Please set your new password.' 
                : 'Password reset successfully! Redirecting to login...'}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg text-red-700 dark:text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {step === 'verify' ? (
          <motion.div
            key="verify"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              Enter the 6-digit code sent to your email address.
            </p>

            <form onSubmit={verifyForm.handleSubmit(onVerifyOTP)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  {...verifyForm.register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {verifyForm.formState.errors.email && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {verifyForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  {...verifyForm.register('code', { 
                    required: 'Code is required',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'Code must be exactly 6 digits'
                    }
                  })}
                  className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
                {verifyForm.formState.errors.code && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {verifyForm.formState.errors.code.message}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Didn't receive the code?{' '}
                  <Link 
                    to="/forgot-password" 
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Request a new one
                  </Link>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Verify Code'
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="reset"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              Enter your new password below.
            </p>

            <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  {...resetForm.register('newPassword', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                {resetForm.formState.errors.newPassword && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {resetForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  {...resetForm.register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => 
                      value === resetForm.getValues('newPassword') || 'Passwords do not match'
                  })}
                  className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                {resetForm.formState.errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {resetForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </motion.div>
        )}

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <Link 
            to="/login" 
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline transition-colors"
          >
            Back to Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
