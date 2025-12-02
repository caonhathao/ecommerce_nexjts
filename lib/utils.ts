import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// export const formatCurrency = (amount: any, currencyCode = 'USD') => {
//   return new Intl.NumberFormat('en-US', {
//     style: 'currency',
//     currency: currencyCode,
//   }).format(Number(amount));
// };

type CurrencyCode = 'VND' | 'USD' | 'JPY' | 'EUR' | string;

interface FormatOptions {
  currency?: CurrencyCode; // Đơn vị tiền tệ muốn đổi sang (Mặc định VND)
  rate?: number; // Tỷ giá hối đoái (VND chia cho số này)
  locale?: string; // Định dạng vùng (ví dụ: en-US cho USD)
}

// Map mặc định locale cho các loại tiền phổ biến để đỡ phải truyền vào thủ công
const LOCALE_MAP: Record<string, string> = {
  VND: 'vi-VN',
  USD: 'en-US',
  JPY: 'ja-JP',
  EUR: 'de-DE',
};

export function formatPrice(
  value: number | string | null,
  options: FormatOptions = {}
): string {
  let numValue = Number(value);
  console.log('value', value);
  console.log(numValue);

  if (
    value === null ||
    value === undefined ||
    value === '' ||
    isNaN(numValue)
  ) {
    return '0';
  }

  const { currency = 'VND', rate = 1 } = options;

  // 2. Tính toán tỷ giá
  // Nếu tỷ giá khác 1, ta thực hiện chia (hoặc nhân tùy logic lưu DB của bạn)
  // Ví dụ: DB lưu 25000 (VND), muốn ra USD (rate 25000) => 25000 / 25000 = 1
  if (rate && rate > 0 && currency !== 'VND') {
    numValue = numValue / rate;
  }

  // 3. Tự động chọn locale nếu không truyền vào
  // Nếu đổi sang USD thì dùng format Mỹ (1.00), VND thì format VN (1,00)
  const locale = options.locale || LOCALE_MAP[currency] || 'en-US';

  try {
    return numValue.toLocaleString(locale, {
      style: 'currency',
      currency: currency,
      // Với tiền Việt/Yên Nhật thì thường không cần số thập phân, còn USD thì cần 2 số
      maximumFractionDigits: ['VND', 'JPY'].includes(currency) ? 2 : 2,
    });
  } catch (error) {
    console.error(error);
    return `${numValue} ${currency}`;
  }
}

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

export function formatDay(value: string | null | undefined) {
  if (!value) return '';
  return dayjs(value).format('DD/MM/YYYY HH:mm:ss');
}
