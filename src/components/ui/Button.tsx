import React from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'motion/react';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-white shadow-lg shadow-emerald-200 hover:bg-emerald-600',
      secondary: 'bg-slate-900 text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800',
      outline: 'bg-transparent border-2 border-emerald-100 text-primary hover:bg-emerald-50',
      ghost: 'bg-transparent text-slate-500 hover:bg-slate-50',
      danger: 'bg-rose-500 text-white shadow-lg shadow-rose-200 hover:bg-rose-600',
    };

    const sizes = {
      sm: 'px-4 py-2 text-[10px]',
      md: 'px-6 py-3 text-xs',
      lg: 'px-8 py-4 text-sm',
      xl: 'px-10 py-5 text-base',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={cn(
          'rounded-2xl font-black uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
