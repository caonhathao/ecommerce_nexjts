'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { fetchData } from '@/funcs/fetch';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction, useState } from 'react';
import { useForm } from 'react-hook-form';
import { IoFilterOutline } from 'react-icons/io5';
import { RiResetRightLine } from 'react-icons/ri';
import { z } from 'zod';

interface SearchProps<T> {
  baseUrl: string;
  placeholder: string;
  setData: Dispatch<SetStateAction<T | null>>;
  isReset: boolean;
  setIsReset: Dispatch<SetStateAction<boolean>>;
  setIsFalse: Dispatch<SetStateAction<boolean>>;
  keyQueryList: string[];
}

const formSchema = z.object({
  keyword: z.string().min(1, 'Không có từ khóa'),
});

const SearchBar = <T,>({
  baseUrl,
  placeholder,
  setData,
  setIsReset,
  isReset,
  setIsFalse,
  keyQueryList,
}: SearchProps<T>) => {
  const t = useTranslations('admin_search_bar');

  const [keyQuery, setKeyQuery] = useState<string>(keyQueryList[0]);

  async function onSubmit(value: z.infer<typeof formSchema>) {
    try {
      // const response = await fetch(`${baseUrl}?${keyQuery}=${value.keyword}`);

      const response = await fetchData({
        baseUrl: baseUrl,
        params: { [keyQuery]: value.keyword },
        setData: undefined,
      });
      if (
        response.success === 403 ||
        response.success === 500 ||
        response.success === 400
      ) {
        setData(null);
        setIsFalse(true);
      } else {
        setData(response.data);
        setIsFalse(false);
      }
    } catch (e) {
      console.error(e);
    }
  }

  //define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      keyword: '',
    },
  });

  //console.log(keyQuery);

  return (
    <div className="w-full flex flex-row justify-center items-center gap-3 mb-5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-[50%]">
          <FormField
            control={form.control}
            name="keyword"
            render={({ field }) => (
              <FormItem>
                <InputGroup>
                  <InputGroupInput placeholder={placeholder} {...field} />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      variant={'outline'}
                      onClick={() => {
                        form.reset();
                        setIsReset(!isReset);
                        setIsFalse(false);
                      }}
                      className="hover:cursor-pointer"
                    >
                      <RiResetRightLine />
                    </InputGroupButton>
                    <InputGroupButton
                      variant="secondary"
                      type="submit"
                      className="hover:cursor-pointer"
                    >
                      {t('t_search_action')}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="hover:cursor-pointer">
              <IoFilterOutline />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel>{t('t_filter_by')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={keyQuery}
              onValueChange={setKeyQuery}
            >
              {keyQueryList.map((value, key) => (
                <DropdownMenuRadioItem
                  key={key}
                  value={value}
                  className="hover:cursor-pointer"
                >
                  {t(`t_${value}`)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default SearchBar;
