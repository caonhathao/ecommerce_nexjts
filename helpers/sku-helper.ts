import { prisma } from '@/lib/db';

/**
 * Make a short random alphanumeric string
 */
function randomSuffix(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < length; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/**
 * Client-side SKU generator based on a name (title / variant name) or random.
 * Produces uppercase alphanumeric SKUs safe to use immediately on the client.
 */
export function generateClientSku(name?: string): string {
  const base = name
    ? name
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/Đ/g, 'D')
        .replace(/[^A-Z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 12)
    : 'SKU';
  return `${base}-${randomSuffix(4)}`;
}

/**
 * Server-side check: is SKU taken globally (uses prisma)
 */
export async function isSkuTaken(
  sku: string,
  excludeId?: string
): Promise<boolean> {
  const existing = await prisma.productVariant.findFirst({
    where: {
      sku,
      ...(excludeId && { id: { not: excludeId } }),
    },
    select: { id: true },
  });
  return !!existing;
}

/**
 * Server-side: generate a guaranteed unique SKU (checks DB). Use from server APIs if needed.
 */
export async function generateUniqueSkuServer(name?: string): Promise<string> {
  const base = generateClientSku(name).replace(/-[A-Z0-9]{4}$/, ''); // keep base portion
  let candidate = `${base}-${randomSuffix(4)}`;
  let attempts = 0;
  const maxAttempts = 10;
  while ((await isSkuTaken(candidate)) && attempts < maxAttempts) {
    candidate = `${base}-${randomSuffix(4)}`;
    attempts++;
  }
  return candidate;
}
