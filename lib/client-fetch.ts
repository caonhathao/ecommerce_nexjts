import { ServiceResponse } from '@/types/api-response';

export async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<ServiceResponse<T>> {
  const res = await fetch(url, options);

  const payload = await res.json();

  return payload as ServiceResponse<T>;
}
