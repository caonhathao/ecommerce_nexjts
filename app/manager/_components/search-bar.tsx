'use client';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { itemData } from '@/types/manager.data-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import { RiResetRightLine } from 'react-icons/ri';
import { z } from 'zod';

interface SearchProps {
  baseUrl: string;
  setData: Dispatch<SetStateAction<itemData>>;
  isReset: boolean;
  setIsReset: Dispatch<SetStateAction<boolean>>;
}

const formSchema = z.object({
  id: z.string().nonempty('Thiếu id'),
});

const SearchBar = ({ baseUrl, setData, setIsReset, isReset }: SearchProps) => {
  const t = useTranslations('admin_search_bar');
  async function onSubmit(value: z.infer<typeof formSchema>) {
    try {
      const response = await fetch(`${baseUrl}?id=${value.id}`);
      const data = await response.json();
      console.log('data searched:', data.data);
      if (data.success === 403 || data.success === 500) setData([]);
      else setData(data.data);
    } catch (e) {
      console.error(e);
    }
  }

  //define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
    },
  });

  return (
    <div className="w-full flex flex-row justify-center items-center mb-5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-[50%]">
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <InputGroup>
                  <InputGroupInput
                    placeholder={t('t_search_placeholder')}
                    {...field}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      variant={'outline'}
                      onClick={() => {
                        form.reset();
                        setIsReset(!isReset);
                      }}
                    >
                      <RiResetRightLine />
                    </InputGroupButton>
                    <InputGroupButton variant="secondary" type="submit">
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
    </div>
  );
};

export default SearchBar;
