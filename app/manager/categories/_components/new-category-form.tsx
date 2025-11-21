'use client';
import { Loading } from '@/app/(public)/_components/loading';
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
import {
  categoryDataResponse,
  categoryItemData,
} from '@/types/manager.data-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

const formSchema = z.object({
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

export const NewCategoryForm = ({
  setIsReset,
}: {
  setIsReset: Dispatch<SetStateAction<boolean>>;
}) => {
  const [data, setData] = React.useState<categoryDataResponse | null>(null);
  const [list, setList] = React.useState<categoryItemData[]>([]);
  const [open, setOpen] = React.useState<boolean>(false);
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      isActive: 'false',
      parentId: '',
    },
  });

  async function onSubmit(values: FormSchemaType) {
    try {
      const data = await postData('/api/manager/category', values);
      if (data.status === 200) {
        toast('Tạo thành công', {
          description: 'Đã tạo mới danh mục sản phẩm.',
        });
        setTimeout(() => {
          setOpen(false);
          setIsReset((prev) => !prev);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to create category:', error);
      toast('Tạo thất bại', {
        description: 'Không thể tạo mới danh mục.',
      });
    }
  }

  useEffect(() => {
    // Fetch categories or any other data if needed
    fetchData(
      '/api/manager/category',
      { page: 1, limit: 1000, isActive: 'true' },
      setData
    );
  }, []);
  useEffect(() => {
    if (data) {
      setList(data.data);
    }
  }, [data]);

  if (!data) {
    return <Loading />;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size={'sm'} onClick={() => form.reset()}>
          <IconPlus />
          Tạo mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Danh mục mới</DialogTitle>
              <DialogDescription>
                Tạo mới danh mục sản phẩm của bạn.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="name-1">Tên danh mục</Label>
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
              <div className="grid gap-3">
                <Label htmlFor="active-1">Trạng thái</Label>
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
                            <SelectValue placeholder="Trạng thái" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="true">Hiển thị</SelectItem>
                              <SelectItem value="false">Ẩn</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="parent-id-1">Danh mục cha</Label>
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem className="flex-1 ">
                      {' '}
                      <FormControl>
                        <Select
                          {...field}
                          name="parentId"
                          defaultValue={''}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger
                            className="flex w-fit @4xl/main:hidden"
                            size="sm"
                            id="active-1"
                          >
                            <SelectValue placeholder="Thuộc danh mục" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {list?.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
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
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={() => form.reset()}>
                  Hủy
                </Button>
              </DialogClose>
              <Button type="submit">Đồng ý</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
