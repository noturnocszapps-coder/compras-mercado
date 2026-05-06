import React, { useState, useEffect } from 'react';
import { Mic, X, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface VoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: any) => void;
}

export default function VoiceAssistant({ isOpen, onClose, onAction }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
    }
  }, [isOpen]);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const result = event.results[current][0].transcript;
      setTranscript(result);
    };

    recognition.onend = async () => {
      setIsListening(false);
      if (transcript) {
        processTranscript(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      setError('Erro ao capturar áudio. Tente falar novamente.');
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const processTranscript = async (text: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const result = await response.json();
      onAction(result);
      onClose();
    } catch (err) {
      setError('Falha ao processar comando com IA.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            className="bg-white w-full max-w-sm rounded-[60px] p-12 shadow-2xl flex flex-col items-center gap-8 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-3 bg-blue-600"></div>
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-8 text-slate-300 hover:text-slate-600"
            >
              <X size={24} strokeWidth={3} />
            </button>

            <div className="relative">
              <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500",
                isListening ? "bg-blue-100 scale-125" : "bg-slate-50"
              )}>
                <Mic 
                  size={48} 
                  strokeWidth={3} 
                  className={cn(
                    "transition-colors",
                    isListening ? "text-blue-600" : "text-slate-300"
                  )}
                />
              </div>
              {isListening && (
                <motion.div 
                  className="absolute inset-0 border-4 border-blue-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-black uppercase tracking-tight">
                {isListening ? 'Ouvindo...' : isProcessing ? 'Processando...' : 'Fale agora'}
              </h3>
              <p className="text-slate-400 font-bold italic h-6">
                {transcript || 'Diga algo como "Adicionar Leite"'}
              </p>
            </div>

            {isProcessing && (
              <div className="flex items-center gap-2 text-blue-600 font-black italic animate-pulse">
                <Sparkles size={20} />
                <span>MAGIA DA IA...</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-2xl font-bold text-xs">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 w-full gap-4">
              {isListening ? (
                <button 
                  onClick={() => setIsListening(false)}
                  className="bold-button-secondary !py-4 font-black"
                >
                  PARAR
                </button>
              ) : (
                <button 
                  onClick={startListening}
                  className="bold-button-primary !bg-blue-600 !shadow-blue-100 !py-4 font-black"
                >
                  TENTAR NOVAMENTE
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
