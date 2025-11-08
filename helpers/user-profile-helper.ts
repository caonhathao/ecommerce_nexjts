import { UserProfileResponseDTO } from '@/types/dtos/user.dto';
import { UserProfileFormValues } from '@/app/(public)/(customer)/customer/account/makeUserSchema';

export function splitBirthDate(iso: string | null | undefined) {
  if (!iso) return { day: '', month: '', year: '' };
  // Accept both full ISO or YYYY-MM-DD
  const d = new Date(iso);
  if (!isNaN(d.getTime())) {
    return {
      day: String(d.getUTCDate()),
      month: String(d.getUTCMonth() + 1),
      year: String(d.getUTCFullYear()),
    };
  }
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m)
    return {
      year: m[1],
      month: String(Number(m[2])),
      day: String(Number(m[3])),
    };
  return { day: '', month: '', year: '' };
}

export function buildBirthDateString(day: string, month: string, year: string) {
  if (!year || !month || !day) return ''; // submit empty => server ignores
  // zero-pad month/day
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

export function normalizeGender(
  g: string | null | undefined
): 'male' | 'female' | 'other' | undefined {
  if (!g) return undefined;
  const v = g.toLowerCase();
  if (['male', 'm', 'nam'].includes(v)) return 'male';
  if (['female', 'f', 'nữ', 'nu'].includes(v)) return 'female';
  return 'other';
}

export function mapDtoToFormValues(
  dto: UserProfileResponseDTO
): UserProfileFormValues {
  return {
    fullName: dto.name ?? '',
    emailForBill: dto.emailForBill ?? '',
    phone: dto.phone ?? '',
    gender: normalizeGender(dto.gender),
    birthDate: splitBirthDate(dto.birthDate),
  };
}
