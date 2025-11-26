import { getOrderDrafts } from '@/app/actions/order_draft';
import { PaymentClient } from '@/app/(public)/checkout/component/payment_client';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldDescription,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { formatPrice } from '@/app/(public)/_components/global-function';

export default async function CheckoutPage() {
  const { success, draft, error } = await getOrderDrafts();

  if (!success || !draft) {
    return (
      <div className="p-6 text-center text-red-500">
        Lỗi: {error || 'Không tìm thấy đơn hàng'}
      </div>
    );
  }

  const draftPlain = {
    ...draft,
    itemsTotal: draft.itemsTotal.toString(),
    shippingFee: draft.shippingFee.toString(),
    discountTotal: draft.discountTotal.toString(),
    grandTotal: draft.grandTotal.toString(),
    items: draft.items.map((item) => ({
      ...item,
      unitPrice: item.unitPrice.toString(),
      total: item.total.toString(),
    })),
  };

  const shipping = draft.shippingInfor as Record<string, any>;

  return (
    <div className="w-full min-h-screen py-8">
      <div className="p-6 w-5/6 mx-auto bg-background grid grid-cols-2 gap-6 rounded-lg shadow-lg">
        {/* ---------------------------- */}
        {/* CỘT TRÁI: Thông tin giao hàng */}
        {/* ---------------------------- */}
        <div className="col-span-1">
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Địa chỉ nhận hàng</FieldLegend>
              <FieldDescription>
                Vui lòng kiểm tra lại thông tin trước khi thanh toán.
              </FieldDescription>

              <div className="mt-4 space-y-3">
                <Field orientation="horizontal">
                  <FieldLabel className="w-1/4">Người nhận</FieldLabel>
                  <Input disabled value={shipping.name} />
                </Field>

                <Field orientation="horizontal">
                  <FieldLabel className="w-1/4">Số điện thoại</FieldLabel>
                  <Input disabled value={shipping.phone} />
                </Field>

                <Field orientation="horizontal">
                  <FieldLabel className="w-1/4">Địa chỉ</FieldLabel>
                  <Input disabled value={shipping.address} />
                </Field>

                <Field orientation="horizontal">
                  <FieldLabel className="w-1/4">Phường/Xã</FieldLabel>
                  <Input disabled value={shipping.ward} />
                </Field>

                <Field orientation="horizontal">
                  <FieldLabel className="w-1/4">Quận/Huyện</FieldLabel>
                  <Input disabled value={shipping.district} />
                </Field>

                <Field orientation="horizontal">
                  <FieldLabel className="w-1/4">Thành phố</FieldLabel>
                  <Input disabled value={shipping.city} />
                </Field>
              </div>
            </FieldSet>
          </FieldGroup>
        </div>

        {/* ---------------------------- */}
        {/* CỘT PHẢI: Danh sách sản phẩm + thanh toán */}
        {/* ---------------------------- */}
        <div className="col-span-1 flex flex-col gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <Label className="text-lg font-semibold mb-2 block">
              Danh sách sản phẩm
            </Label>

            <div className="divide-y max-h-[260px] overflow-y-auto pr-2">
              {draftPlain.items.map((item, i) => (
                <Item key={i} variant="outline" className="py-3">
                  <ItemMedia>
                    <Image
                      src={
                        item.product.images?.[0]?.url ||
                        '/placeholder-product.png'
                      }
                      alt={item.title || 'Sản phẩm'}
                      width={64}
                      height={64}
                      className="rounded-md object-cover"
                    />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="font-semibold text-base">
                      {item.title}
                    </ItemTitle>
                    <ItemDescription className="text-sm text-foreground font-medium">
                      {formatPrice(item.unitPrice)}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <div className="flex flex-col items-end text-sm gap-2">
                      <p className="text-sm font-medium text-foreground">
                        Số lượng: {item.quantity}
                      </p>
                      <p className="font-semibold text-primary">
                        {formatPrice(item.total)}
                      </p>
                    </div>
                  </ItemActions>
                </Item>
              ))}
            </div>

            <div className="pt-4 mt-4 border-t text-right space-y-1">
              <p className="flex justify-between">
                <span className="text-base text-foreground">Tạm tính:</span>{' '}
                <span className="font-medium">
                  {formatPrice(draft.itemsTotal.toNumber())}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-base text-foreground">
                  Phí vận chuyển:
                </span>{' '}
                <span className="font-medium">
                  {formatPrice(draft.shippingFee.toNumber())}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-base text-foreground">Giảm giá:</span>{' '}
                <span className="font-medium text-destructive">
                  -{formatPrice(draft.discountTotal.toNumber())}
                </span>
              </p>
              <p className="text-lg font-semibold flex justify-between">
                Tổng thanh toán:{' '}
                <span className="text-primary">
                  {formatPrice(draft.grandTotal.toNumber())}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <PaymentClient draftId={draft.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
