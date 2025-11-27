import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: any, currencyCode = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(Number(amount));
};

export function getUserInitial(user: {
  name?: string | null;
  email: string;
}): string {
  if (user.name && user.name.trim().length > 0) {
    return user.name.trim()[0].toUpperCase();
  }
  return user.email.trim()[0].toUpperCase();
}

export function getUserNameOrEmailPrefix(user: {
  name?: string | null;
  email: string;
}): string {
  if (user.name && user.name.trim().length > 0) {
    return user.name.trim();
  }
  const emailParts = user.email.split('@');
  if (emailParts.length > 0) {
    return emailParts[0];
  }
  return 'User';
}
