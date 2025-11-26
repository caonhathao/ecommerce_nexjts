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
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  query: z.string().min(1, 'Please enter a search term'),
});

type FormSchemaType = z.infer<typeof formSchema>;

const SearchingBar = () => {
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

    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-row items-center gap-0 w-[85%] h-10 overflow-hidden shadow-none border-none rounded-lg pl-4 bg-card m-0"
        >
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem className="flex-1 mb-0 bg-card border-none shadow-none">
                <FormControl>
                  <Input
                    placeholder={t('search_placeholder')}
                    {...field}
                    className="w-full border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none !bg-transparent transition-colors file:bg-transparent focus:bg-transparent placeholder:text-muted-foreground [transition:background-color_9999s_ease-in-out_0s]"
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

          <Separator orientation="vertical" className="mx-0" />

          <Button
            variant="ghost"
            type="submit"
            className="text-primary h-full rounded-none rounded-r-md px-6 hover:bg-muted hover:text-primary"
          >
            {t('search_button')}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SearchingBar;
