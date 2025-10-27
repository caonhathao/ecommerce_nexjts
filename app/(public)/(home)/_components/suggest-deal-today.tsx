"use client";
import { data_one } from "@/app/(public)/_data/data_top.json";
import { buttonVariants } from "@/components/ui/button";
import { productDataTypes } from "@/types/public.data-types";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ProductItem } from "../../_components/product-item";


export const SuggestDealToday = () => {
  const t = useTranslations("suggest_deal_today");
  return (
    <div className="w-full flex flex-col justify-center items-center gap-2 bg-[var(--background)] rounded-lg mt-5 p-2">
      {/* top-title */}
      <p className="w-full text-left font-bold">{t("title")}</p>
      {/* content here */}
      <div className="w-full flex flex-row gap-2">
        {data_one.map((item: productDataTypes, index) => (
          <ProductItem item={item} />
        ))}
      </div>
      {/* watch more */}
      <div className="w-full flex justify-center items-center">
        <Link
          href={"#"}
          className={buttonVariants({
            variant: "outline",
            className: "text-[var(--primary)]",
          })}
        >
          {t("watch_more")}
        </Link>
      </div>
    </div>
  );
};
