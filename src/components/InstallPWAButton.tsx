import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIos(isIosDevice);

    // Prompt for Android/Chrome
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If iOS and not standalone, show CTA
    if (isIosDevice && !isStandalone) {
      setIsVisible(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosTip(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsVisible(false);
      }
    }
  };

  if (!isVisible || isStandalone) return null;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary/10 border border-primary/20 p-4 rounded-[32px] flex items-center justify-between gap-4 mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <Download size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800 leading-none">Instalar App</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Experiência Premium</p>
          </div>
        </div>
        <button 
          onClick={handleInstallClick}
          className="bg-primary text-white px-6 py-2.5 rounded-2xl font-black text-xs shadow-md active:scale-95 transition-all"
        >
          INSTALAR
        </button>
      </motion.div>

      <AnimatePresence>
        {showIosTip && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end p-4" onClick={() => setShowIosTip(false)}>
            <motion.div 
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              className="bg-white w-full rounded-[40px] p-8 flex flex-col gap-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800">Instalar no iPhone</h3>
                <button onClick={() => setShowIosTip(false)} className="p-2 bg-slate-50 rounded-full">
                   <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                    <Share size={24} />
                  </div>
                  <p className="text-slate-600 font-medium">1. Toque no botão de <b>Compartilhar</b> na barra inferior do Safari.</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                    <PlusSquare size={24} />
                  </div>
                  <p className="text-slate-600 font-medium">2. Role para baixo e toque em <b>Adicionar à Tela de Início</b>.</p>
                </div>
              </div>

              <button 
                onClick={() => setShowIosTip(false)}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-emerald-200 mt-2"
              >
                ENTENDI
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
