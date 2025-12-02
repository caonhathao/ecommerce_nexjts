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

export function formatTime(isoString: string | Date): string {
  const date = isoString instanceof Date ? isoString : new Date(isoString);

  const timePart = date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const datePart = date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return `${timePart} - ${datePart}`;
}
