import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { formatDateSP } from './date';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | number) {
  return formatDateSP(date);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
