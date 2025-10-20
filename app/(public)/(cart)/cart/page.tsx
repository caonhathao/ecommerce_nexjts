'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { TicketIcon, Trash, TrashIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function Cart() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Đang tải giỏ hàng...</div>;
  if (!cart) return <div>Không có giỏ hàng nào!</div>;

  return (
    <div className=" min-h-screen w-full">
      <div className="w-3/4 min-h-screen mx-auto py-6">
        {/*title*/}
        <h1 className="text-xl font-semibold mb-4">🛒 Giỏ hàng</h1>

        {/* cart */}
        <div className="grid grid-flow-col grid-rows-5 grid-cols-4 gap-4 ">
          <div className="col-span-3  bg-white rounded-2xl shadow-xs">
            <div className="grid grid-cols-[45%_15%_15%_15%_10%] px-4 gap-2 items-center h-full">
              {/* col 1 */}
              <div className="flex items-center gap-3">
                <Checkbox id="choose-all" />
                <Label htmlFor="choose-all">Chọn tất cả</Label>
              </div>
              {/* col 2 */}
              <div className="text-center font-semibold">Đơn giá</div>
              {/* col 3 */}
              <div className="text-center font-semibold">Số lượng</div>
              {/* col 4 */}
              <div className="text-center font-semibold">Thành tiền</div>
              {/* col 5 */}
              <div className="text-center">
                <Button variant="ghost" size="sm">
                  <TrashIcon className="w-5 h-5 text-primary" />
                </Button>
              </div>
            </div>
          </div>
          <div className="col-span-3 row-span-2 bg-blue-50 rounded-2xl shadow-xs">
            {cart.items.map((item: any) => (
              <div className="grid grid-cols-[45%_15%_15%_15%_10%] p-4 gap-2 items-center">
                <div className="flex items-center gap-3">
                  <Checkbox id={item.id} />
                  <img
                    src={item.variant.product.images[0]}
                    alt={item.variant.product.alt}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex flex-col justify-start items-left gap-3 overflow-ellipsis">
                    <Label htmlFor={item.variant.product.title}>
                      {item.variant.product.title}
                    </Label>
                    <Label htmlFor={item.id}>{item.variant.name}</Label>
                  </div>
                </div>
                <div className="text-center">{item.variant.price} &#8363;</div>
                <div className="flex gap-2 items-center justify-center">
                  <Button variant="outline" size="icon-sm">
                    +
                  </Button>
                  <Label htmlFor={item.id}>{item.quantity}</Label>
                  <Button variant="outline" size="icon-sm">
                    -
                  </Button>
                </div>
                <div className="text-center">
                  {item.quantity * item.variant.price} &#8363;
                </div>
                <Button variant="ghost" size="icon" className="mx-auto">
                  <TrashIcon className="w-5 h-5 text-primary" />
                </Button>
              </div>
            ))}
          </div>

          {/* Voucher */}
          <div className="row-span-3 flex flex-col justify-evenly bg-red-50 rounded-2xl shadow-xs p-4 gap-3">
            <div className="flex items-center gap-3 justify-between">
              <Label htmlFor="title">Khuyến mãi</Label>
              <Label
                htmlFor="disable"
                className="text-gray-400 cursor-not-allowed select-none"
              >
                Có thể áp dụng 2
              </Label>
            </div>
            {/* voucher 1 */}
            <div className="flex items-center justify-between bg-blue-50 border border-blue-300 rounded-xl p-3 shadow-sm">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                TIKI
              </div>
              <div className="mx-3 w-px h-8 border-r border-dashed border-blue-400"></div>
              <div className="flex-1 flex items-center gap-2 text-blue-800 text-sm">
                <span>Giảm 6% tối đa...</span>
                <button className="text-blue-500 hover:text-blue-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
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
                <button className="text-blue-500 hover:text-blue-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition">
                Bỏ Chọn
              </button>
            </div>
            <Button variant="link" className="flex cursor-pointer">
              <TicketIcon className="w-5 h-5 text-primary" />
              <p>Mua thêm để nhận freeship lên đến 300k ...</p>
            </Button>
          </div>

          {/* Payment infor */}
          <div className="row-span-2 flex flex-col justify-evenly bg-green-100 rounded-2xl shadow-xs p-4">
            <div className="flex items-center gap-3 justify-between">
              <p className="text-gray-400 cursor-not-allowed select-none text-sm">
                Tổng tiền hàng
              </p>
              <p>
                {cart.items
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
              <p className="text-gray-400 cursor-not-allowed select-none text-sm">
                Giảm giá trực tiếp
              </p>
              <p className="text-green-400"> -
                {cart.items
                  .reduce(
                    (total: number, item: any) =>
                      total + Number(item.variant.price) * item.quantity/10,
                    0
                  )
                  .toLocaleString('vi-VN')}{' '}
                ₫
              </p>
            </div>
            <div className="flex items-center gap-3 justify-between">
              <p className="text-gray-400 cursor-not-allowed select-none text-sm">
                Mã khuyến mãi
              </p>
              <p className="text-green-400"> -
                {cart.items
                  .reduce(
                    (total: number, item: any) =>
                      total + Number(item.variant.price) * item.quantity/20,
                    0
                  )
                  .toLocaleString('vi-VN')}{' '}
                ₫
              </p>
            </div>
            <Separator />
            <div className="flex items-center gap-3 justify-between">
              <p className="text-gray-400 cursor-not-allowed select-none text-sm">
                Tổng tiền thanh thoán
              </p>
              <p className="text-red-400">
                {cart.items
                  .reduce(
                    (total: number, item: any) =>
                      total + Number(item.variant.price) * item.quantity/20,
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
  );
}
