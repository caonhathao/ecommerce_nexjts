import { useTranslations } from "next-intl";
import logo from "@/public/logo.png";
const data = [
  {
    name: "deal_vip",
    icon: logo,
  },
  {
    name: "super_sale",
    icon: logo,
  },
  {
    name: "cheap_morning",
    icon: logo,
  },
  {
    name: "combo_super_sale",
    icon: logo,
  },
    {
    name: "trading",
    icon: logo,
  },
  {
    name: "hot_coupon",
    icon: logo,
  },
  {
    name: "holiday",
    icon: logo,
  },
  {
    name: "half_price",
    icon: logo,
  },
  {
    name: "top_book",
    icon: logo,
  },
];
export const CategoryPromotionPanel = () => {
  const t = useTranslations("category_promotion_panel");
  return (
    <div className="w-full flex flex-row justify-center items-start border border-gray-200 rounded-lg p-2 mt-5">
      {data.map((item, index) => (
        <div className="flex flex-col justify-center items-center hover:cursor-pointer">
          <img src={item.icon.src} alt="logo" className="w-[20%]"/>
          <p className="w-full text-center">{t(item.name)}</p>
        </div>
      ))}
    </div>
  );
};
