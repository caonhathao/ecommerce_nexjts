'use client';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Separator } from '@/components/ui/separator';
import { fetchData } from '@/funcs/fetch';
import { useIsMobile } from '@/hooks/use-mobile';
import { shopData } from '@/types/public.data-types';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { IoChatboxEllipsesOutline } from 'react-icons/io5';
import { MdOutlineRateReview } from 'react-icons/md';
import { Loading } from '../../_components/loading';
import SearchingBar from '../_components/searching-bar';

const ShopPage = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();
  const [shopData, setShopData] = useState<shopData | null>(null);
  const isMobile = useIsMobile();

  const decodedSlug = useMemo(() => {
    return decodeURIComponent(params.slug as string);
  }, [params]);

  console.log(decodedSlug);
  useEffect(() => {
    const fetch = async () => {
      const res = await fetchData({
        baseUrl: '/api/shop/query',
        params: { slug: decodedSlug },
        setData: undefined,
      });
      if (res) {
        //console.log(res);
        setShopData(res.data);
      }
    };
    fetch();
  }, []);

  if (!shopData)
    return (
      <div className="w-screen h-screen">
        <Loading />
      </div>
    );

  return (
    <div className="w-full flex flex-col justify-center items-center gap-3 bg-background my-3">
      {/* show shop info */}
      <div className="w-full h-fit bg-linear-to-r from-primary to-secondary flex justify-center items-center">
        <div className="relative w-fit h-fit">
          {/* show cover phto */}
          <Image
            src={shopData.coverUrl}
            width={1200}
            height={300}
            alt="cover-photo"
          />
          {/* show a box with logo and others info */}
          <div className=" rounded-lg bg-background absolute left-5 bottom-5 p-3 flex flex-row justify-between items-center gap-5 drop-shadow-md drop-shadow-primary border-2 broder-primary">
            {/* logo */}
            <Image
              src={shopData.logoUrl}
              width={50}
              height={50}
              alt="shop-logo"
              className="rounded-lg"
            />
            {/* show name and rating */}
            <div className="flex flex-col justify-center items-start h-fit">
              <p>{shopData.name}</p>
              <div className="flex flex-row justify-start items-center gap-2">
                <p className="flex flex-row gap-2 justify-start items-center">
                  {shopData.ratingAvg}{' '}
                  <FaStar size={15} color="var(--primary)" />
                </p>
                <Separator orientation="vertical" />
                <p>{shopData.ratingCount} đánh giá</p>
              </div>
            </div>
            {/* buttons action */}
            <div className="flex gap-2">
              <Button variant={'outline'} className="hover:cursor-pointer">
                <MdOutlineRateReview color="var(--primary)" />
                Đánh giá
              </Button>
              <Button variant={'outline'} className="hover:cursor-pointer">
                <IoChatboxEllipsesOutline color="var(--primary)" />
                Chat
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* navigator bar: will navigate to store page (home page), products, to-sale and one search bar */}
      <div className="w-[70%] flex flex-row justify-between items-center bg-background">
        <NavigationMenu viewport={isMobile}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Cửa hàng</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="w-full">
                  <li className="text-nowrap">
                    <NavigationMenuLink href="#">
                      Xem đánh giá
                    </NavigationMenuLink>
                  </li>
                  <li className="text-nowrap">
                    <NavigationMenuLink href={`/shop/${decodedSlug}`}>
                      Thông tin chung
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Sản phẩm</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="w-full">
                  <li className="text-nowrap">
                    <NavigationMenuLink
                      href={`/shop/${decodedSlug}/products?id=${shopData.id}&filter=`}
                    >
                      Tất cả
                    </NavigationMenuLink>
                  </li>
                  <li className="text-nowrap">
                    <NavigationMenuLink
                      href={`/shop/${decodedSlug}/products?id=${shopData.id}&filter=new`}
                    >
                      Sản phẩm mới
                    </NavigationMenuLink>
                  </li>
                  <li className="text-nowrap">
                    <NavigationMenuLink
                      href={`/shop/${decodedSlug}/products?id=${shopData.id}&filter=top`}
                    >
                      Nổi bật
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href={`/shop/${decodedSlug}/profile`}>
                Hô sơ
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="w-[40%]">
          <SearchingBar id={shopData.id} />
        </div>
      </div>
      <div className="w-[70%]">{children}</div>
    </div>
  );
};
export default ShopPage;
