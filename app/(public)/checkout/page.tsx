import { getOrderDrafts } from '@/app/actions/order_draft';
import { CheckoutClient } from '@/app/(public)/checkout/_components/checkout-client';

export default async function CheckoutPage() {
  const result = await getOrderDrafts();

  return <CheckoutClient order_draft={result} />;
}
