import React from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'motion/react';

interface CardProps extends HTMLMotionProps<"div"> {
  hover?: boolean;
}

export const Card = ({ className, hover = true, children, ...props }: CardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4 } : undefined}
      className={cn(
        'bg-white rounded-[40px] border border-slate-100 p-8 shadow-xl shadow-slate-900/5 transition-all overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-slate-100", className)}
      {...props}
    />
  );
};
