"use client";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const SelectLanguage = () => {
  const t = useTranslations("layout");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const changeLang = (event: string) => {
    const lang = event;
    console.log(lang);
    const withoutLocale = pathname.replace(/^\/(vi|en|jp)(\/|$)/, "/");
    router.push(`/${lang}${withoutLocale}`);
  };

  const [width, setWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    // Hàm cập nhật kích thước
    const handleResize = () => setWidth(window.innerWidth);

    // Lấy kích thước ban đầu
    handleResize();

    // Lắng nghe sự kiện resize
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={width > 1000 ? "default" : "icon"}
          className={"text-[var(--primary)] hover:cursor-pointer"}
        >
          {width > 1000 ? t("language") : <img src={t("icon")} />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(val) => changeLang(val)}
        >
          <DropdownMenuRadioItem value={"vi"}>
            <div className="flex flex-row justify-center items-center gap-2 hover:cursor-pointer">
              <img
                width="48"
                height="48"
                src="https://img.icons8.com/color/48/vietnam.png"
                alt="vietnam"
              />
              <p>Tiếng Việt</p>
            </div>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={"en"}>
            <div className="flex flex-row justify-center items-center gap-2 hover:cursor-pointer">
              <img
                width="48"
                height="48"
                src="https://img.icons8.com/color/48/great-britain.png"
                alt="great-britain"
              />
              <p>English</p>
            </div>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={"jp"}>
            <div className="flex flex-row justify-center items-center gap-2 hover:cursor-pointer">
              <img
                width="48"
                height="48"
                src="https://img.icons8.com/?size=100&id=22435&format=png&color=000000"
                alt="japan"
              />
              <p>日本語</p>
            </div>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
