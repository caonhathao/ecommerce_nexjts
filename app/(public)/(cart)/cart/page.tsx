'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { TicketIcon, TrashIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useDebounce } from '@/hooks/debounce';
import { CartType } from '@/types/cart.data-types';

const emptyCart: CartType = {
  id: '',
  userId: '',
  items: [],
};

export default function Cart() {
  const [cart, setCart] = useState<CartType>(emptyCart);
  const [loading, setLoading] = useState(true);
  let noItems = false;
  const [selectedItem, setSelectedItem] = useState<string[]>([]);
  const allSelected =
    cart?.items?.length > 0 && selectedItem.length === cart.items.length;

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(`${window.location.origin}/api/cart`);
        if (!res.ok) throw new Error('Failed to fetch cart');
        const data = await res.json();
        setCart(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const [pendingUpdates, setPendingUpdates] = useState<Record<string, number>>(
    {}
  );

  const updateLocalQuantity = (variantId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCart((prev: any) => ({
      ...prev,
      items: prev.items.map((item: any) =>
        item.variant.id === variantId
          ? { ...item, quantity: newQuantity }
          : item
      ),
    }));

    setPendingUpdates((prev) => ({
      ...prev,
      [variantId]: newQuantity,
    }));
  };

  const updatesRef = useRef(pendingUpdates);
  useEffect(() => {
    updatesRef.current = pendingUpdates;
  }, [pendingUpdates]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (Object.keys(updatesRef.current).length > 0) {
        navigator.sendBeacon(
          '/api/cart/update',
          JSON.stringify({ items: updatesRef.current })
        );
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const debouncedUpdates = useDebounce(pendingUpdates, 1000);

  useEffect(() => {
    if (Object.keys(debouncedUpdates).length === 0) return;

    const formattedItems = Object.entries(debouncedUpdates).map(
      ([variantId, quantity]) => ({
        variant: { id: variantId },
        quantity,
      })
    );

    fetch('/api/cart', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: formattedItems }),
    })
      .then(() => setPendingUpdates({}))
      .catch(console.error);
  }, [debouncedUpdates]);

  const removeItem = async (variantId: string) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
      const res = await fetch(`/api/cart/${variantId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId }),
      });

      if (res.ok) {
        setCart((prev: any) => ({
          ...prev,
          items: prev.items.filter(
            (item: any) => item.variant.id !== variantId
          ),
        }));
        setPendingUpdates((prev) => {
          const newUpdates = { ...prev };
          delete newUpdates[variantId];
          return newUpdates;
        });
      } else {
        alert('Xóa thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Lỗi khi xóa sản phẩm:', err);
      alert('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  };

  const clearCart = async () => {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) return;

    try {
      const res = await fetch('/api/cart', { method: 'DELETE' });
      if (res.ok) {
        setCart((prev: any) => ({ ...prev, items: [] }));
        setPendingUpdates({});
      } else {
        alert('Xóa giỏ hàng thất bại.');
      }
    } catch (err) {
      console.error('Lỗi khi xóa giỏ hàng:', err);
      alert('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  };

  if (loading) return <div>Đang tải giỏ hàng...</div>;
  if (!cart || !cart.items || cart.items.length == 0) {
    noItems = true;
  }
  return (
    <div className="min-h-screen w-full">
      <div className="w-3/4 mx-auto py-6">
        {/* title */}
        <h1 className="text-xl font-semibold mb-4">🛒 Giỏ hàng</h1>

        {/* layout chính */}
        <div className="grid grid-cols-4 gap-6">
          {/* giỏ hàng */}
          <div className="col-span-3 flex flex-col gap-4">
            {/* header */}
            <div className="bg-white rounded-2xl shadow-xs">
              <div className="grid grid-cols-[45%_15%_15%_15%_10%] px-4 gap-2 items-center h-full">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="choose-all"
                    checked={allSelected}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedItem(
                          cart.items.map((item: any) => item.variant.id)
                        );
                      } else {
                        setSelectedItem([]);
                      }
                    }}
                  />
                  <Label htmlFor="choose-all">Chọn tất cả</Label>
                </div>
                <div className="text-center font-semibold">Đơn giá</div>
                <div className="text-center font-semibold">Số lượng</div>
                <div className="text-center font-semibold">Thành tiền</div>
                <div className="text-center">
                  <Button variant="ghost" size="sm" onClick={() => clearCart()}>
                    <TrashIcon className="w-5 h-5 text-primary" />
                  </Button>
                </div>
              </div>
            </div>

            {/* danh sách sản phẩm */}
            <div className="bg-white rounded-2xl shadow-xs divide-y">
              {noItems && (
                <div className="p-4 text-center text-gray-500">
                  Không có sản phẩm trong giỏ hàng .
                </div>
              )}
              {cart.items.map((item: any) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[45%_15%_15%_15%_10%] p-4 gap-2 items-center"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={item.id}
                      checked={selectedItem.includes(item.variant.id)}
                      onCheckedChange={(checked) => {
                        setSelectedItem((prev: string[]) =>
                          checked
                            ? [...prev, item.variant.id]
                            : prev.filter(
                                (id: string) => id !== item.variant.id
                              )
                        );
                      }}
                    />
                    <img
                      src={item.variant.product.images[0]}
                      alt={item.variant.product.alt}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex flex-col justify-start items-left gap-1 overflow-ellipsis">
                      <Label htmlFor={item.variant.product.title}>
                        {item.variant.product.title}
                      </Label>
                      <Label htmlFor={item.id}>{item.variant.name}</Label>
                    </div>
                  </div>
                  <div className="text-center">{item.variant.price} ₫</div>
                  <div className="flex gap-2 items-center justify-center">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      disabled={item.quantity <= 1}
                      onClick={() =>
                        updateLocalQuantity(item.variant.id, item.quantity - 1)
                      }
                    >
                      -
                    </Button>
                    <Label htmlFor={item.id}>{item.quantity}</Label>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      disabled={item.quantity >= item.variant.stock}
                      onClick={() =>
                        updateLocalQuantity(item.variant.id, item.quantity + 1)
                      }
                    >
                      +
                    </Button>
                  </div>
                  <div className="text-center">
                    {item.quantity * item.variant.price} ₫
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mx-auto"
                    onClick={() => removeItem(item.variant.id)}
                  >
                    <TrashIcon className="w-5 h-5 text-primary" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* cột phải: khuyến mãi + thanh toán */}
          <div className="col-span-1 flex flex-col gap-4">
            {/* Voucher */}
            <div className="flex flex-col bg-white rounded-2xl shadow-xs p-4 gap-3">
              <div className="flex items-center gap-3 justify-between">
                <Label htmlFor="title">Khuyến mãi</Label>
                <Label
                  htmlFor="disable"
                  className="text-gray-400 cursor-not-allowed select-none"
                >
                  Có thể áp dụng 2
                </Label>
              </div>
              {/* voucher items */}
              <div className="space-y-3">
                {/* voucher 1 */}
                <div className="flex items-center justify-between bg-blue-50 border border-blue-300 rounded-xl p-3 shadow-sm">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    TIKI
                  </div>
                  <div className="mx-3 w-px h-8 border-r border-dashed border-blue-400"></div>
                  <div className="flex-1 flex items-center gap-2 text-blue-800 text-sm">
                    <span>Giảm 6% tối đa...</span>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition">
                    Bỏ Chọn
                  </button>
                </div>
                {/* voucher 2 */}
                <div className="flex items-center justify-between bg-blue-50 border border-blue-300 rounded-xl p-3 shadow-sm">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#2f9e44] rounded-lg flex items-center justify-center">
                    <img
                      src="/free-shipping-100.png"
                      alt="..."
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="mx-3 w-px h-8 border-r border-dashed border-blue-400"></div>
                  <div className="flex-1 flex items-center gap-2 text-blue-800 text-sm">
                    <span>Giảm 6% tối đa...</span>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition">
                    Bỏ Chọn
                  </button>
                </div>
              </div>

              <Button variant="link" className="flex cursor-pointer mt-2">
                <TicketIcon className="w-5 h-5 text-primary" />
                <p>Mua thêm để nhận freeship lên đến 300k ...</p>
              </Button>
            </div>

            {/* Payment info */}
            <div className="flex flex-col justify-evenly bg-white rounded-2xl shadow-xs p-4 gap-3">
              <div className="flex items-center gap-3 justify-between">
                <p className="text-gray-400 text-sm">Tổng tiền hàng</p>
                <p>
                  {cart.items
                    .filter((item: any) =>
                      selectedItem.includes(item.variant.id)
                    )
                    .reduce(
                      (total: number, item: any) =>
                        total + Number(item.variant.price) * item.quantity,
                      0
                    )
                    .toLocaleString('vi-VN')}{' '}
                  ₫
                </p>
              </div>
              <div className="flex items-center gap-3 justify-between">
                <p className="text-gray-400 text-sm">Giảm giá trực tiếp</p>
                <p className="text-green-400">
                  -
                  {cart.items
                    .filter((item) => selectedItem.includes(item.variant.id))
                    .reduce(
                      (total: number, item: any) =>
                        total +
                        (Number(item.variant.price) * item.quantity) / 10,
                      0
                    )
                    .toLocaleString('vi-VN')}{' '}
                  ₫
                </p>
              </div>
              {/*<div className="flex items-center gap-3 justify-between">*/}
              {/*  <p className="text-gray-400 text-sm">Mã khuyến mãi</p>*/}
              {/*  <p className="text-green-400">*/}
              {/*    -*/}
              {/*    {cart.items*/}
              {/*      .reduce(*/}
              {/*        (total: number, item: any) =>*/}
              {/*          total +*/}
              {/*          (Number(item.variant.price) * item.quantity) / 20,*/}
              {/*        0*/}
              {/*      )*/}
              {/*      .toLocaleString('vi-VN')}{' '}*/}
              {/*    ₫*/}
              {/*  </p>*/}
              {/*</div>*/}
              <Separator />
              <div className="flex items-center gap-3 justify-between">
                <p className="text-gray-400 text-sm">Tổng thanh toán</p>
                <p className="text-red-400">
                  {cart.items
                    .filter((item: any) =>
                      selectedItem.includes(item.variant.id)
                    )
                    .reduce(
                      (total: number, item: any) =>
                        total +
                        (Number(item.variant.price) * item.quantity -
                          (Number(item.variant.price) * item.quantity) / 10),
                      0
                    )
                    .toLocaleString('vi-VN')}{' '}
                  ₫
                </p>
              </div>
              <Button variant="default" className="w-full cursor-pointer">
                Mua hàng
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
