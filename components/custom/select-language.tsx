'use client';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export const SelectLanguage = () => {
  const t = useTranslations('layout');
  const locale = useLocale();
  const router = useRouter();

  const changeLang = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`; // 1 year
    router.refresh();
  };

  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    // Hàm cập nhật kích thước
    const handleResize = () => setWidth(window.innerWidth);

    // Lấy kích thước ban đầu
    handleResize();

    // Lắng nghe sự kiện resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={width > 1000 ? 'default' : 'icon'}
          className={'text-primary hover:cursor-pointer'}
        >
          {width > 1000 ? (
            t('language')
          ) : (
            <Image
              src={t('icon')}
              alt="flag-country"
              width={0}
              height={0}
              className="object-contain"
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 drop-shadow-md drop-shadow-secondary">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(val) => changeLang(val)}
        >
          <DropdownMenuRadioItem value={'vi'}>
            <div className="flex flex-row justify-center items-center gap-2 hover:cursor-pointer">
              <Image
                width="48"
                height="48"
                src="https://img.icons8.com/color/48/vietnam.png"
                alt="vietnam"
              />
              <p>Tiếng Việt</p>
            </div>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={'en'}>
            <div className="flex flex-row justify-center items-center gap-2 hover:cursor-pointer">
              <Image
                width="48"
                height="48"
                src="https://img.icons8.com/color/48/great-britain.png"
                alt="great-britain"
              />
              <p>English</p>
            </div>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={'jp'}>
            <div className="flex flex-row justify-center items-center gap-2 hover:cursor-pointer">
              <Image
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
