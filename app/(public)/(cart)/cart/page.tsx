"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Trash, TrashIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function Cart() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(`${window.location.origin}/api/cart`);
        if (!res.ok) throw new Error("Failed to fetch cart");
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
    <div className="w-full h-full flex flex-col justify-start border-1 rounded-md shadow-sm p-4 ">
      <h1 className="text-2xl font-semibold mb-4">🛒 Giỏ hàng</h1>

      {/* Header */}
      <Table className="rounded-md [&_thead_tr]:border-0 [&_tbody_tr]:border-0">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px] flex items-center gap-2">
              <Checkbox id="checkAll" />
              <Label htmlFor="checkAll">
                Tất cả ({cart.items.length} sản phẩm)
              </Label>
            </TableHead>
            <TableHead className="text-center">Đơn giá</TableHead>
            <TableHead className="text-center">Số lượng</TableHead>
            <TableHead className="text-center">Thành tiền</TableHead>
            <TableHead className="text-center">
              <Button variant="ghost" size="sm">
                <TrashIcon className="w-5 h-5 text-primary" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        {/* Body */}
        <TableBody>
          <TableRow className="border-0">
            <TableCell colSpan={5} className="h-5 bg-gray-100 "></TableCell>
          </TableRow>
          {cart.items.map((item: any) => (
            <TableRow key={item.id}>
              <TableCell className="flex items-center gap-3">
                <Checkbox />
                <p className="font-medium">{item.variant.name}</p>
              </TableCell>

              <TableCell className="text-center font-semibold">
                {Number(item.priceSnap).toLocaleString("vi-VN")}₫
              </TableCell>

              <TableCell className="text-center">{item.quantity}</TableCell>

              <TableCell className="text-center font-semibold">
                {(Number(item.priceSnap) * item.quantity).toLocaleString(
                  "vi-VN",
                )}
                ₫
              </TableCell>

              <TableCell className="text-center">
                <Button variant="ghost" size="sm">
                  <TrashIcon className="w-4 h-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Separator />
      <div className="w-full flex flex-col justify-center items-center mt-4 gap-4">
        <div className="w-full px-2 flex  justify-between items-center">
          <Label htmlFor="">Tổng tiền hàng</Label>
          <span className="">
            {cart.items
              .reduce(
                (total: number, item: any) =>
                  total + Number(item.priceSnap) * item.quantity,
                0,
              )
              .toLocaleString("vi-VN")}
            ₫
          </span>
        </div>
        <div className="w-full px-2 flex justify-between items-center">
          <Label htmlFor="">Giảm giá trực tiếp</Label>

          <span className="text-green-600">
            -
            {cart.items
              .reduce(
                (total: number, item: any) =>
                  total + Number(item.priceSnap) * item.quantity / 2,
                0,
              )
              .toLocaleString("vi-VN")}
            ₫
          </span>
        </div>
        <div className="w-full px-2 flex justify-between items-center">
          <Label htmlFor="">Mã khuyến mãi từ ...</Label>

          <span className="text-green-600">
            -
            {cart.items
              .reduce(
                (total: number, item: any) =>
                  total + Number(item.priceSnap) * item.quantity / 10,
                0,
              )
              .toLocaleString("vi-VN")}
            ₫
          </span>
        </div>
      </div>
      <div className="h-5"></div>
      <Button className="bg-primary text-white hover:bg-primary/90">
        Tiến hành thanh toán
      </Button>
    </div>
  );
}
