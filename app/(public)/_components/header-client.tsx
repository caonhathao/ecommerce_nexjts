"use client";

import { ModeToogle } from '@/components/custom/mode-toogle';
import { SelectLanguage } from '@/components/custom/select-language';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import SearchingBar from '@/app/(public)/_components/searching-bar';
import { Button } from '@/components/ui/button';
import {
  LogIn,
  LogOut,
  MapPin,
  Package,
  ShoppingCartIcon,
  User2,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

type Role = 'USER' | 'SELLER' | 'ADMIN'
type HeaderUser = { name: string; email?: string; avatar_url?: string; role: Role } | null;

const HeaderClient = ({user}:{user:HeaderUser}) => {
  const router = useRouter();
  const t = useTranslations("home_layout");
  const n = useTranslations("user_navbar");
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsSticky(window.scrollY > 100);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  async function signOut() {
    try{
      console.log('Signing out...');
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            console.log('Signed out successfully');
            router.push('/');
          }
      }});
    } catch(e){
      console.error('Error signing out:', e);
    }
  }

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
              <Button asChild variant="outline">
                <Link href="/cart" className="inline-flex items-center">
                  <ShoppingCartIcon className="w-5 h-5 text-primary" />
                </Link>
              </Button>
            {/*  Auth */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0 rounded-full">
                      <Avatar className="w-9 h-9">
                          <AvatarImage src={user.avatar_url} alt={user.name} />
                          <AvatarFallback>
                            <User2 className="w-5 h-5" />
                          </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="truncate">{user.name}</DropdownMenuLabel>
                    {user.email ? (
                      <div className="px-2 pb-1 text-xs text-muted-foreground truncate">{user.email}</div>
                    ) : null}
                    <DropdownMenuSeparator/>

                  {/*  User shortcuts*/}
                    <DropdownMenuItem asChild>
                      <Link href="/customer/account/edit" className="flex items-center gap-2">
                        <User2 className="h-4 w-4"/>
                        {n('profile')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/customer/account/orders" className="flex items-center gap-2">
                        <Package className="h-4 w-4"/>
                        {n('orders')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/customer/account/address" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4"/>
                        {n('addresses')}
                      </Link>
                    </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    {n('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild>
                  <Link href="/auth/login" className="inline-flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    {n('login')}
                  </Link>
                </Button>
              )}
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
export default HeaderClient;
