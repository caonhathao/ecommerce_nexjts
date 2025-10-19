"use client";

import { ModeToogle } from "@/components/custom/mode-toogle";
import { SelectLanguage } from "@/components/custom/select-language";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import SearchingBar from "../../app/(public)/_components/searching-bar";

const Header = () => {
  const t = useTranslations("home_layout");
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-full h-fit p-2 flex flex-col justify-center items-center relative">
      {/* logo, searching zone and tags  */}
      <div
        className={`w-full flex justify-center items-center transition-all duration-300 ${
          isSticky
            ? "fixed top-0 left-0 bg-white shadow-md z-50"
            : "relative bg-transparent"
        }`}
      >
        <div className="w-[80%] h-fit p-2 flex flex-row justify-center items-center gap-4">
          {/* logo and slogan */}
          <div className="w-[10%] flex flex-col justify-center items-center">
            <img src={"/logo-name.jpg"} alt="logo" className="w-full" />
            <p className="text-[var(--primary)]">{t("slogan")}</p>
          </div>
          {/* searching bar and tags  */}
          <div className="w-full flex flex-col justify-start items-start gap-1">
            {/* searching bar, change language*/}
            <div className="w-full gap-2 flex flex-row justify-center items-center">
              <SearchingBar />
              <SelectLanguage />
              <ModeToogle />
            </div>
            {/* tags  */}
            <div className="flex flex-row justify-start items-center gap-3">
              <Link href={""}>{t("electronics")}</Link>
              <Link href={""}>{t("vehicles")}</Link>
              <Link href={""}>{t("mom_baby")}</Link>
              <Link href={""}>{t("beauty")}</Link>
              <Link href={""}>{t("house")}</Link>
              <Link href={""}>{t("book")}</Link>
              <Link href={""}>{t("sports")}</Link>
            </div>
          </div>
        </div>
      </div>
      <Separator />
      {/* slogans */}
      <div className="w-full p-2 flex flex-row justify-center items-center gap-4">
        <Link href="" className="text-[var(--primary)] font-medium">
          {t("commitment")}
        </Link>
        <Link href="" className="font-medium">
          {t("genuine_goods")}
        </Link>
        <Link href="" className="font-medium">
          {t("freeship_all")}
        </Link>
        <Link href="" className="font-medium">
          {t("refund_200")}
        </Link>
        <Link href="" className="font-medium">
          {t("return_30_days")}
        </Link>
        <Link href="" className="font-medium">
          {t("fast_delivery_2h")}
        </Link>
        <Link href="" className="font-medium">
          {t("super_cheap_price")}
        </Link>
      </div>
      <Separator />
    </div>
  );
};
export default Header;
