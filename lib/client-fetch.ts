import { ApiResponse } from '@/types/api';

export async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(url, options);

  const payload = await res.json();

  return payload as ApiResponse<T>;
}
