import dayjs from 'dayjs';
export function formatPrice(value: number | string | null): string {
  value = Number(value);

  if (!value || value <= 0) return '0';
  const c = value.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });

  //console.log(`currecncy` + c);
  return c;
}

export function formatDay(value: string | null | undefined) {
  if (!value) return '';
  return dayjs(value).format('DD/MM/YYYY HH:mm:ss');
}
