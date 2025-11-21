import { useTranslations } from 'next-intl';
import Image from 'next/image';
const data = [
  {
    name: 'deal_vip',
    icon: 'https://salt.tikicdn.com/ts/upload/2b/e0/e7/05cf3f6008c57d97c9f5d8759c68633e.png',
  },
  {
    name: 'super_sale',
    icon: 'https://salt.tikicdn.com/ts/upload/ff/a6/e1/a6cf760c8a71eb317856728600845165.png',
  },
  {
    name: 'cheap_morning',
    icon: 'https://salt.tikicdn.com/ts/upload/72/8d/23/a810d76829d245ddd87459150cb6bc77.png',
  },
  {
    name: 'combo_super_sale',
    icon: 'https://salt.tikicdn.com/ts/upload/8a/39/6b/e7e02deb76e79a7a467847c62c55d0d5.png',
  },
  {
    name: 'trading',
    icon: 'https://salt.tikicdn.com/ts/upload/1c/1d/ab/a8853ac90be1473f095ee2437bab90ab.png',
  },
  {
    name: 'hot_coupon',
    icon: 'https://salt.tikicdn.com/ts/upload/8b/a4/9f/84d844f70e365515b6e4e3e745dac1d5.png',
  },
  {
    name: 'holiday',
    icon: 'https://salt.tikicdn.com/ts/upload/a9/77/f7/ac974e8b2db087d3c78a88c000b23dc1.png',
  },
  {
    name: 'half_price',
    icon: 'https://salt.tikicdn.com/ts/upload/a5/d8/06/cb6ff520f12973013c81a8b14ad5e5b3.png',
  },
  {
    name: 'top_book',
    icon: 'https://salt.tikicdn.com/ts/upload/4a/47/32/96cd0a5ab8f34621667f47a05e08d8b0.png',
  },
];
export const CategoryPromotionPanel = () => {
  const t = useTranslations('category_promotion_panel');
  return (
    <div className="w-full flex flex-row justify-evenly items-center bg-background rounded-lg py-3 overflow-x-auto">
      {data.map((item, index) => (
        <div
          key={index}
          className="flex flex-col gap-1 justify-center items-center hover:cursor-pointer"
        >
          <Image
            width={40}
            height={40}
            src={item.icon}
            alt="logo"
            className="rounded-2xl"
          />
          <p className="w-4/5 text-center text-base overflow-hidden">
            {t(item.name)}
          </p>
        </div>
      ))}
    </div>
  );
};
