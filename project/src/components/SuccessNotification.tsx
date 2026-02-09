import React from 'react';
import { CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SuccessNotificationProps {
  message: string;
  onClose: () => void;
}

export const SuccessNotification: React.FC<SuccessNotificationProps> = ({ message, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 50, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 50, scale: 0.8 }}
        className="fixed top-4 right-4 z-50"
      >
        <motion.div 
          className="bg-black/90 backdrop-blur-lg border-2 border-red-400/50 rounded-xl shadow-lg py-3 px-4 flex items-center gap-3 relative overflow-hidden"
          animate={{
            boxShadow: [
              "0 0 10px rgba(239,68,68,0.3)",
              "0 0 20px rgba(239,68,68,0.5), 0 0 30px rgba(220,38,38,0.3)",
              "0 0 10px rgba(239,68,68,0.3)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-red-500/10 to-red-500/10 animate-pulse" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <CheckCircle className="w-5 h-5 text-red-400 flex-shrink-0" style={{ filter: 'drop-shadow(0 0 6px #ef4444)' }} />
          </motion.div>
          <p className="text-red-300 text-sm font-bold whitespace-nowrap relative z-10" style={{ textShadow: '0 0 8px #ef4444' }}>
            {message}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};