import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30',
      border: 'border-l-4 border-green-500 dark:border-green-400',
      text: 'text-green-800 dark:text-green-200',
      iconBg: 'bg-green-100 dark:bg-green-800/50',
      iconColor: 'text-green-600 dark:text-green-400',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    error: {
      bg: 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30',
      border: 'border-l-4 border-red-500 dark:border-red-400',
      text: 'text-red-800 dark:text-red-200',
      iconBg: 'bg-red-100 dark:bg-red-800/50',
      iconColor: 'text-red-600 dark:text-red-400',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30',
      border: 'border-l-4 border-blue-500 dark:border-blue-400',
      text: 'text-blue-800 dark:text-blue-200',
      iconBg: 'bg-blue-100 dark:bg-blue-800/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      )
    }
  };

  const style = styles[type] || styles.success;

  return (
    <motion.div
      initial={{ opacity: 0, x: 400, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 400, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`fixed top-6 right-6 z-[9999] flex items-start gap-4 px-5 py-4 rounded-xl shadow-2xl backdrop-blur-sm ${style.bg} ${style.border} ${style.text} min-w-[320px] max-w-md border-t border-r border-b border-gray-200/50 dark:border-gray-700/50`}
    >
      <div className={`flex-shrink-0 ${style.iconBg} ${style.iconColor} p-2 rounded-lg`}>
        {style.icon}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm font-semibold leading-relaxed">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 group"
        aria-label="Close notification"
      >
        <svg className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
};

export default Toast;

