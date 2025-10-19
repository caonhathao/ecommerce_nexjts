"use client";

import {useEffect, useState} from "react";

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
        <div className="w-full h-full flex flex-col justify-start items-center">
            <h1 className="text-2xl font-semibold mb-4">🛒 Giỏ hàng</h1>

            <div className="w-full max-w-3xl space-y-4">
                {cart.items.map((item: any) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between border p-3 rounded-lg"
                    >
                        <div>
                            <p className="font-medium">{item.variant.name}</p>
                            <p className="text-sm text-gray-500">
                                Số lượng: {item.quantity}
                            </p>
                        </div>
                        <div className="font-semibold">
                            {Number(item.priceSnap).toLocaleString("vi-VN")}₫
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}