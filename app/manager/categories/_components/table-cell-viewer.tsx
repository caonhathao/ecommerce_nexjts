'use client';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { putData } from '@/funcs/put';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  categoryChildDetail,
  categoryDetail,
  categoryItemData,
} from '@/types/manager.data-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconDotsVertical } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { IoIosArrowUp } from 'react-icons/io';
import { toast } from 'sonner';
import z from 'zod';
import { handleDelete } from '../_funcs/funcs';

const formSchema = z.object({
  id: z.string(),
  name: z.string().min(1, {
    message: 'Name is required.',
  }),
  slug: z.string().min(1, {
    message: 'Slug is required.',
  }),
  isActive: z.enum(['true', 'false']),
  parentId: z.string().optional(),
});

type FormSchemaType = z.infer<typeof formSchema>;

export function TableCellViewer({
  item,
  defaultActive,
  setDefaultActive,
  setCategoryList,
  setIsReset,
  handleCopy,
}: {
  item: categoryItemData;
  defaultActive: string;
  setDefaultActive: React.Dispatch<React.SetStateAction<string>>;
  setCategoryList: React.Dispatch<React.SetStateAction<categoryItemData[]>>;
  setIsReset: React.Dispatch<React.SetStateAction<boolean>>;
  handleCopy: (id: string) => void;
}) {
  const isMobile = useIsMobile();
  const [detail, setDetail] = React.useState<categoryDetail | null>(null);
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = React.useState<boolean>(false);
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      name: '',
      slug: '',
      isActive: 'false',
      parentId: '',
    },
  });
  const t = useTranslations('admin_category_page.category_drawer');

  // This effect runs when 'openIndex' changes
  useEffect(() => {
    // Only run if an item was OPENED
    if (openIndex !== null) {
      // We must wait for your 300ms animation to finish
      const timer = setTimeout(() => {
        const container = scrollContainerRef.current;

        // Find the specific <li> element we want to scroll to
        const element = document.getElementById(`variant-item-${openIndex}`);

        if (container && element) {
          // This calculates the <li>'s position *inside* the scroll container
          const scrollToPosition = element.offsetTop - container.offsetTop;

          // Scroll the container to the element
          container.scrollTo({
            top: scrollToPosition,
            behavior: 'smooth',
          });
        }
      }, 300); // 300ms matches your animation

      // Clean up the timer
      return () => clearTimeout(timer);
    }
  }, [openIndex]);

  useEffect(() => {
    if (detail) {
      setDefaultActive(detail.isActive.toString());
      form.setValue('id', detail.id);
      form.setValue('name', detail.name);
      form.setValue('slug', detail.slug);
      form.setValue('isActive', detail.isActive === true ? 'true' : 'false');
      form.setValue('parentId', detail?.parentId || '');
    }
  }, [detail]);

  async function fetchDetail() {
    try {
      const response = await fetch(`/api/manager/category/query?id=${item.id}`);
      const detail = await response.json();
      console.log(detail.data);
      setDetail(detail.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function onSubmit(values: FormSchemaType) {
    try {
      const data = await putData('/api/manager/category', values);
      if (data.status === 200) {
        toast(t('t_action_noti'), {
          description: t('t_update_des_noti'),
        });
        setTimeout(() => {
          setOpen(false);
          setIsReset((prev) => !prev);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to create category:', error);
      toast(t('t_action_noti'), {
        description: t('t_update_des_noti'),
      });
    }
  }

  const renderVariant = (index: number, value: categoryChildDetail) => {
    return (
      <div
        className={`w-full flex flex-col gap-4 
        ${openIndex === index ? 'max-h-[500px]' : 'max-h-0'}
        transition-[max-height] duration-300 ease-in-out
        overflow-hidden`}
        key={index}
      >
        <div className="flex flex-row justify-between items-center gap-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="name">{t('t_category_name')}</Label>
            <div className="w-full">{value.name}</div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <IconDotsVertical />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem className="flex justify-center items-center">
                <Button
                  variant={'ghost'}
                  className="text-left"
                  onClick={() => handleCopy(value.id)}
                >
                  {t('t_copy_action')}
                </Button>
              </DropdownMenuItem>
              <Separator />
              <DropdownMenuItem className="flex justify-center items-center">
                <Button
                  variant={'destructive'}
                  className="text-left w-full"
                  onClick={() => {
                    handleDelete({
                      id: value.id,
                      setIsReset: setIsReset,
                    });
                    setOpen(false);
                  }}
                >
                  {t('t_del_action')}
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="sku">URL-friendly</Label>
            <div className="w-full">{value.slug}</div>
          </div>
        </div>

        <Separator />
      </div>
    );
  };

  return (
    <Drawer
      direction={isMobile ? 'bottom' : 'right'}
      open={open}
      onOpenChange={setOpen}
    >
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left"
          onClick={fetchDetail}
        >
          {item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{detail?.name || 'unknown'}</DrawerTitle>
          <DrawerDescription>{t('t_category_desc')}</DrawerDescription>
        </DrawerHeader>
        <div
          className="flex flex-col gap-4 overflow-y-auto px-4 text-sm"
          ref={scrollContainerRef}
        >
          <Form {...form}>
            <form
              id={'form-edit-category'}
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="name-1">{t('t_category_name')}</Label>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="flex-1 ">
                        <FormControl>
                          <Input
                            {...field}
                            defaultValue={field.value}
                            onChange={field.onChange}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="slug-1">URL-friendly</Label>
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem className="flex-1 ">
                        <FormControl>
                          <Input
                            {...field}
                            defaultValue={field.value}
                            onChange={field.onChange}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="visibility">{t('t_is_active')}</Label>
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex-1 ">
                      <FormControl>
                        <Select
                          {...field}
                          name="isActive"
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger
                            className="flex w-fit @4xl/main:hidden"
                            size="sm"
                            id="active-1"
                          >
                            <SelectValue
                              placeholder={t('t_is_active_placeholder')}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="true">
                                {t('c_active')}
                              </SelectItem>
                              <SelectItem value="false">
                                {t('c_inactive')}
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="w-full flex flex-col gap-3">
                  <Label htmlFor="target">{t('t_parent_category')}</Label>
                  {detail?.parent ? (
                    <div className="flex flex-row justify-between items-center gap-4">
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="name">{t('t_category_name')}</Label>
                        <div className="w-full">{detail.name}</div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                            size="icon"
                          >
                            <IconDotsVertical />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem className="flex justify-center items-center">
                            <Button
                              variant={'ghost'}
                              className="text-left"
                              onClick={() => handleCopy(detail.parent.id)}
                            >
                              {t('t_copy_action')}
                            </Button>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    <div>{t('t_no_parent')}</div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="variants-list">{t('t_child_categories')}</Label>
                {detail?.children.length !== 0 ? (
                  <div className="flex flex-col  gap-4">
                    <ul className="w-full flex flex-col gap-2 ">
                      {detail?.children.map(
                        (value: categoryChildDetail, index) => (
                          <li
                            key={index}
                            id={`variant-item-${index}`}
                            className="flex flex-col gap-2"
                          >
                            <div className="w-full flex flex-row justify-between items-center">
                              <div className="flex flex-row justify-start items-center gap-2">
                                <p>
                                  {index + 1}
                                  {'. '}
                                </p>
                                <p>{value.name}</p>
                              </div>
                              <Button
                                variant={'outline'}
                                onClick={() =>
                                  setOpenIndex(
                                    openIndex !== index ? index : null
                                  )
                                }
                                type="button"
                              >
                                <div
                                  className={`${openIndex !== index ? `transform-[rotate(180deg)]` : `transform-[rotate(0deg)]`} transition ease-in-out`}
                                >
                                  <IoIosArrowUp />
                                </div>
                              </Button>
                            </div>
                            {renderVariant(index, value)}
                            <Separator />
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                ) : (
                  <div>{t('t_no_child')}</div>
                )}
              </div>
            </form>
          </Form>
        </div>
        <DrawerFooter>
          <Button type="submit" form={'form-edit-category'}>
            {t('t_submit_action')}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">{t('t_cancel_action')}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
