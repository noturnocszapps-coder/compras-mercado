import React, { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function OfflineStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className="fixed top-0 left-0 right-0 z-[1000] bg-slate-900 text-white p-4 flex items-center justify-center gap-3 shadow-2xl"
        >
          <WifiOff size={20} className="text-amber-400" />
          <p className="text-sm font-bold">Você está offline. Algumas funções podem ficar limitadas.</p>
          <button 
            onClick={() => setIsOffline(false)}
            className="ml-4 p-1 hover:bg-white/10 rounded-full"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
