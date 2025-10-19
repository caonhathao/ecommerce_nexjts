"use client";
import { productDataTypes } from "@/types/public.data-types";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ProductItem } from "../../_components/product-item";
import { data_one } from "@/app/(public)/_data/data_top.json";

export const HotForeign = () => {
  const t = useTranslations("hot_foreign");
  return (
    <div className="w-full flex flex-col justify-start items-start gap-1 p-2 mt-5 border border-gray-200 rounded-lg">
      {/* top title */}
      <div className="w-full flex flex-row justify-between items-center">
        <p className="w-fit flex flex-row gap-2 font-bold">{t("title")}</p>
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
