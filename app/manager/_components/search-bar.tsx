'use client';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from '@/components/ui/input-group';
import { productItemData } from '@/types/manager.data-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dispatch, SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface SearchProps {
  setData: Dispatch<SetStateAction<productItemData[]>>;
  searchObject: string;
}

const formSchema = z.object({
  idProduct: z.string().nonempty('Thiếu id'),
});

const SearchBar = ({ setData, searchObject }: SearchProps) => {
  async function onSubmit(value: z.infer<typeof formSchema>) {
    try {
      const response = await fetch(
        `/api/product/manage/search?owner=${searchObject}&&id=${value.idProduct}`
      );
      const data = await response.json();
      console.log('data searched:', data.data);
      if (data.success === 403) setData([]);
      else setData(data.data);
    } catch (e) {
      console.error(e);
    }
  }

  //define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idProduct: '',
    },
  });

  return (
    <div className="w-full flex flex-row justify-center items-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="idProduct"
            render={({ field }) => (
              <FormItem>
                <InputGroup>
                  <InputGroupInput placeholder="ID sản phẩm..." {...field} />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton variant="secondary" type="submit">
                      Search
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
