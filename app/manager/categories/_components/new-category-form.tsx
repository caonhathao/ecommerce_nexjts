'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { fetchData } from '@/funcs/fetch';
import { postData } from '@/funcs/post';
import { paths } from '@/lib/path';
import { cn } from '@/lib/utils';
import {
  categoryDataFormItem,
  categoryDataFormResponse,
} from '@/types/manager.data-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { Check, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ControllerRenderProps, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
export const NewCategoryForm = ({
  setIsReset,
}: {
  setIsReset: Dispatch<SetStateAction<boolean>>;
}) => {
  const t = useTranslations('admin_category_page.category_new_form');
  const [data, setData] = React.useState<categoryDataFormResponse | null>(null);
  const [open, setOpen] = React.useState<boolean>(false);
  const [selected, setSelected] = useState<string>('');

  const formSchema = z.object({
    name: z.string().min(1, {
      message: t('t_name_schema'),
    }),
    slug: z.string().min(1, {
      message: t('t_slug_schema'),
    }),
    isActive: z.enum(['true', 'false']),
    parentId: z.string().optional(),
    image: z
      .file()
      .min(1)
      .max(200 * 1024, {
        message: t('t_file_schema'),
      }),
  });
  type FormSchemaType = z.infer<typeof formSchema>;

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      isActive: 'false',
      parentId: '',
      image: undefined,
    },
  });

  async function onSubmit(values: FormSchemaType) {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('slug', values.slug);
      formData.append('isActive', values.isActive);

      if (values.parentId) {
        formData.append('parentId', values.parentId);
      } else {
        formData.append('parentId', '');
      }

      if (values.image && values.image instanceof File) {
        formData.append('image', values.image);
      }

      const data = await postData({
        url: paths.manager.category.create,
        body: formData,
        contentType: undefined,
      });
      if (data.status === 200) {
        toast(t('t_action_noti'), {
          description: t('t_create_desc_noti'),
        });
        setTimeout(() => {
          setOpen(false);
          setIsReset((prev) => !prev);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to create category:', error);
      toast(t('t_action_failed_noti'), {
        description: t('t_create_failed_desc_noti'),
      });
    }
  }

  const renderCategoryItems = (
    items: categoryDataFormItem[],
    field: ControllerRenderProps<FormSchemaType, 'parentId'>
  ) => {
    return items.map((category) => {
      const hasChildren = category.children && category.children.length > 0;

      // === TRƯỜNG HỢP 1: CÓ CON (HIỂN THỊ DẠNG SPLIT) ===
      if (hasChildren) {
        return (
          // Tạo một container flex để chứa 2 phần: Tên (trái) và Mũi tên (phải)
          <div
            key={category.id}
            className="relative flex w-full cursor-default select-none items-center rounded-sm hover:bg-accent hover:text-accent-foreground text-sm outline-none my-1"
          >
            {/* --- PHẦN BÊN TRÁI: CLICK ĐỂ CHỌN --- */}
            <div
              className="flex-1 px-2 py-1.5 cursor-pointer flex justify-between items-center"
              onClick={(e) => {
                e.stopPropagation(); // Ngăn sự kiện lan sang nút mở menu
                setSelected(category.name);
                field.onChange(category.id);
              }}
            >
              <span>{category.name}</span>
              {category.id === field.value && (
                <Check className="h-4 w-4 mr-2" />
              )}
            </div>

            {/* --- PHẦN BÊN PHẢI: TRIGGER MỞ MENU CON --- */}
            <DropdownMenuSub>
              {/* Lưu ý: className p-0 và w-auto để thu gọn vùng trigger chỉ vào icon 
               inset={true} giúp căn lề đẹp hơn trong shadcn
            */}
              <DropdownMenuSubTrigger className="flex w-8 items-center justify-center p-0 h-full cursor-pointer focus:bg-accent data-[state=open]:bg-accent">
                {/* Trong shadcn mặc định SubTrigger đã có ChevronRight. 
                 Nếu bạn muốn tùy chỉnh hoặc nếu nó hiển thị 2 mũi tên, 
                 hãy kiểm tra component ui/dropdown-menu của bạn.
                 Thường thì để trống nó sẽ tự render ChevronRight.
               */}
                <span className="sr-only">Mở</span>
              </DropdownMenuSubTrigger>

              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {/* Đệ quy tiếp tục */}
                  {renderCategoryItems(category.children!, field)}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </div>
        );
      }

      // === TRƯỜNG HỢP 2: KHÔNG CÓ CON (ITEM THƯỜNG) ===
      return (
        <DropdownMenuItem
          key={category.id}
          onClick={() => {
            field.onChange(category.id);
            setSelected(category.name);
          }}
          className="justify-between cursor-pointer"
        >
          {category.name}
          {category.id === field.value && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
      );
    });
  };

  // Component chính của bạn gọi hàm render
  const RenderSubMenu = ({
    field,
    data,
  }: {
    field: ControllerRenderProps<FormSchemaType, 'parentId'>;
    data: categoryDataFormItem[];
  }) => {
    return <>{renderCategoryItems(data, field)}</>;
  };

  const selectedFile = form.watch('image');

  const previewUrl = React.useMemo(() => {
    if (selectedFile instanceof File) {
      return URL.createObjectURL(selectedFile);
    }
    return null;
  }, [selectedFile]);

  useEffect(() => {
    fetchData({
      baseUrl: paths.manager.category.fetch_form,
      params: { id: form.watch('parentId') },
      setData: setData,
    });
  }, [open]);

  const list: categoryDataFormItem[] = data?.data || [];
  //console.log(list);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size={'sm'} onClick={() => form.reset()}>
          <IconPlus />
          {t('t_new_button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{t('t_new_category')}</DialogTitle>
              <DialogDescription>{t('t_desc')}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="grid gap-3">
                <Label htmlFor="name-1">{t('t_name')}</Label>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1 ">
                      {' '}
                      <FormControl>
                        <Input {...field} className="" />
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
                      {' '}
                      <FormControl>
                        <Input {...field} className="" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="photo">{t('t_photo')}</Label>
                  <div className="flex flex-row gap-2 justify-start items-center">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt="icon"
                        width={40}
                        height={40}
                      />
                    ) : (
                      <p className="italic">Trống</p>
                    )}
                    <Button
                      type="button"
                      size={'sm'}
                      variant={'outline'}
                      onClick={() =>
                        document.getElementById('input-image-file')?.click()
                      }
                    >
                      {previewUrl ? 'Đổi' : 'Thêm'}
                    </Button>
                    <FormField
                      control={form.control}
                      name="image"
                      render={({
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        field: { value, onChange, ...fieldProps },
                      }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              id="input-image-file"
                              {...fieldProps}
                              placeholder="Upload an image"
                              type="file"
                              accept="image/*"
                              onChange={(event) => {
                                onChange(
                                  event.target.files && event.target.files[0]
                                );
                              }}
                              hidden={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="col-span-1">
                  <Label htmlFor="active-1">{t('t_status')}</Label>
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex-1 ">
                        {' '}
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
                              <SelectValue placeholder={t('t_status')} />
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
              </div>
              <div className="grid gap-3">
                <Label htmlFor="parent-id-1">{t('t_parent_category')}</Label>
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  'justify-between w-fit @4xl/main:hidden', // Giữ lại class cũ của bạn
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value
                                  ? selected
                                  : t('t_belong_category')}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            className="w-[200px]"
                            align="start"
                          >
                            {RenderSubMenu({ data: list, field: field })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={() => form.reset()}>
                  {t('t_cancel_action')}
                </Button>
              </DialogClose>
              <Button type="submit">{t('t_submit_action')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
