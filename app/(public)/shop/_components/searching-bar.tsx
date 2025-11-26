'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  query: z.string().min(1, 'Please enter a search term'),
});

type FormSchemaType = z.infer<typeof formSchema>;

const SearchingBar = ({ id }: { id: string }) => {
  const t = useTranslations('layout');
  const router = useRouter();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: '',
    },
  });

  function onSubmit(values: FormSchemaType) {
    const term = values.query.trim();
    if (!term) return;

    router.push(`/search?q=${encodeURIComponent(term)}&shopId=${id}`);
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-row items-center gap-2 w-full border border-transparent rounded-2xl p-1 bg-card"
        >
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem className="flex-1 mb-0">
                <FormControl>
                  <Input
                    placeholder={t('search_placeholder')}
                    {...field}
                    className="w-full border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none shadow-none bg-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        form.handleSubmit(onSubmit)();
                      }
                    }}
                  />
                </FormControl>
                <FormMessage className="sr-only" />
              </FormItem>
            )}
          />

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant="ghost"
            type="submit"
            className="text-primary hover:bg-transparent hover:text-blue-600"
          >
            {t('search_button')}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SearchingBar;
