import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal = ({ isOpen, onClose, title, children, className }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 pt-safe pb-safe">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "bg-white w-full max-w-lg rounded-[48px] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col gap-8",
              className
            )}
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
            
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">{title}</h3>
                <div className="w-8 h-1 bg-primary/20 rounded-full"></div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 transition-all"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[70vh] px-1 -mx-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
