import dayjs from 'dayjs';
export function formatPrice(value: number | null): string {
  if (!value || value <= 0) return '0';
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

export function formatDay(value: string) {
  return dayjs(value).format('DD/MM/YYYY HH:mm:ss');
}
