"use client";
import React from "react";
import { Sidebar } from "../ui/sidebar";

import { BsTicketPerforated } from "react-icons/bs";
import { FaCar, FaCcAmazonPay, FaCreditCard, FaStore } from "react-icons/fa";
import { FaHouse } from "react-icons/fa6";
import {
  GiBallerinaShoes,
  GiJewelCrown,
  GiSchoolBag,
  GiSonicShoes,
} from "react-icons/gi";
import { IoIosMan } from "react-icons/io";
import { IoLogoElectron, IoWoman } from "react-icons/io5";
import { LuSmartphone } from "react-icons/lu";
import {
  MdCamera,
  MdDeviceHub,
  MdLaptopChromebook,
  MdLocalGroceryStore,
  MdOutlineSportsFootball,
} from "react-icons/md";
import { PiBowlFoodDuotone, PiPaintBrushHousehold } from "react-icons/pi";
import { TbDropletPlus, TbHorseToy } from "react-icons/tb";
import { TiWatch } from "react-icons/ti";

import { useTranslations } from "next-intl";

const category = [
  {
    title: "book_store",
    url: "#",
    icon: FaStore,
  },
  {
    title: "house_life",
    url: "#",
    icon: FaHouse,
  },
  {
    title: "smartphone",
    url: "#",
    icon: LuSmartphone,
  },
  {
    title: "toys_mom&baby",
    url: "#",
    icon: TbHorseToy,
  },
  {
    title: "devices_accessories",
    url: "#",
    icon: MdDeviceHub,
  },
  {
    title: "household_appliances",
    url: "#",
    icon: PiPaintBrushHousehold,
  },
  {
    title: "beauty_healthy",
    url: "#",
    icon: TbDropletPlus,
  },
  {
    title: "vehicle_types",
    url: "#",
    icon: FaCar,
  },
  {
    title: "woman_fashion",
    url: "#",
    icon: IoWoman,
  },
  {
    title: "grocery",
    url: "#",
    icon: MdLocalGroceryStore,
  },
  {
    title: "sport_picnic",
    url: "#",
    icon: MdOutlineSportsFootball,
  },
  {
    title: "man_fashion",
    url: "#",
    icon: IoIosMan,
  },
  {
    title: "cross_border",
    url: "#",
    icon: FaCcAmazonPay,
  },
  {
    title: "pc_accessory",
    url: "#",
    icon: MdLaptopChromebook,
  },
  {
    title: "men_shoes",
    url: "#",
    icon: GiSonicShoes,
  },
  {
    title: "electronics_refrigeration",
    url: "#",
    icon: IoLogoElectron,
  },
  {
    title: "women_shoes",
    url: "#",
    icon: GiBallerinaShoes,
  },
  {
    title: "cameras",
    url: "#",
    icon: MdCamera,
  },
  {
    title: "accessory_fashion",
    url: "#",
    icon: GiJewelCrown,
  },
  {
    title: "delicious",
    url: "#",
    icon: PiBowlFoodDuotone,
  },
  {
    title: "clock_jewelry",
    url: "#",
    icon: TiWatch,
  },
  {
    title: "balo_vali",
    url: "#",
    icon: GiSchoolBag,
  },
  {
    title: "vouchers_services",
    url: "#",
    icon: BsTicketPerforated,
  },
];

const extensions = [
  {
    title: "promotion",
    url: "#",
    icon: BsTicketPerforated,
  },
  {
    title: "pay_top_up",
    url: "#",
    icon: FaCreditCard,
  },
  {
    title: "pay_later",
    url: "#",
    icon: FaCcAmazonPay,
  },
];

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const t = useTranslations("home_layout");

  return (
    <div className="w-[25%]">
      <div className="w-full overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-hide ">
        <div className="flex flex-col jus-end items-end">
          <div className="w-[70%] p-2 bg-[var(--background)] rounded-lg border border-gray-200 flex flex-col justify-start items-start">
            {/* title */}
            <p className="font-medium text-lg text-[var(--primary)]">{t("category")}</p>

            <div className="flex flex-col justify-start items-start pl-2 gap-2 w-full">
              {category.map((item, key) => (
                <div
                  key={key}
                  className="w-full hover:bg-[var(--primary-foreground)] px-3 py-2 rounded-lg transition-all"
                >
                  <a
                    href={item.url}
                    className="flex flex-row gap-2 justify-start items-center"
                  >
                    <item.icon size={20} color="var(--primary)"/>
                    <p>{t(item.title)}</p>
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="w-[70%] p-2 bg-[var(--background)] rounded-lg border border-gray-200 flex flex-col justify-start items-start mt-4">
            {/* title */}
            <p className="font-medium text-lg text-[var(--primary)]">{t("extensions")}</p>

            <div className="flex flex-col justify-start items-start pl-2 gap-2 w-full">
              {extensions.map((item, key) => (
                <div
                  key={key}
                  className="w-full hover:bg-[var(--primary-foreground)] px-3 py-2 rounded-lg transition-all"
                >
                  <a
                    href={item.url}
                    className="flex flex-row gap-2 justify-start items-center"
                  >
                    <item.icon size={20}  color="var(--primary)"/>
                    <p>{t(item.title)}</p>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
