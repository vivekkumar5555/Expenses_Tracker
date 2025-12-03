import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function ResetPassword() {
  const [step, setStep] = useState('verify'); // 'verify' or 'reset'
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const verifyForm = useForm();
  const resetForm = useForm();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setResetToken(token);
      setStep('reset');
    }
  }, [searchParams]);

  const onVerifyOTP = async (data) => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.post('/api/auth/verify-otp', data);
      setResetToken(response.data.resetToken);
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (data) => {
    try {
      setLoading(true);
      setError('');
      await axios.post('/api/auth/reset-password', {
        resetToken,
        newPassword: data.newPassword
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
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
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {step === 'verify' ? (
          <form onSubmit={verifyForm.handleSubmit(onVerifyOTP)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                {...verifyForm.register('email', { required: 'Email is required' })}
                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Verification Code</label>
              <input
                type="text"
                {...verifyForm.register('code', { 
                  required: 'Code is required',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'Code must be 6 digits'
                  }
                })}
                className="w-full px-4 py-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                {...resetForm.register('newPassword', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
              />
              {resetForm.formState.errors.newPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {resetForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                {...resetForm.register('confirmPassword', { 
                  required: 'Please confirm password',
                  validate: value => 
                    value === resetForm.getValues('newPassword') || 'Passwords do not match'
                })}
                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
              />
              {resetForm.formState.errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {resetForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
            Back to Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

