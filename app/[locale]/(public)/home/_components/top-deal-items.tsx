"use client";
import { productDataTypes } from "@/types/public.data-types";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { AiFillLike } from "react-icons/ai";
import { ProductItem } from "../../_components/product-item";
import { data_one } from "../_data/data_top.json";

export const TopDealItems = () => {
  const t = useTranslations("top_deal_items");
  return (
    <div className="w-full flex flex-col justify-start items-start gap-1 p-2 mt-5 border border-gray-200 rounded-lg">
      {/* top title */}
      <div className="w-full flex flex-row justify-between items-center">
        <p className="w-fit flex flex-row gap-2 text-[var(--destructive)] font-bold">
          <AiFillLike color="var(--destructive)" size={20} />
          {t("title")}
        </p>
        <Link href="#" className="text-[var(--primary)] hover:cursor-pointer">
          {t("watch_more")}
        </Link>
      </div>
      {/* item list */}
      <div className="w-full flex flex-row gap-2">
        {data_one.map((item: productDataTypes, index) => (
          <ProductItem item={item} />
        ))}
      </div>
    </div>
  );
};
