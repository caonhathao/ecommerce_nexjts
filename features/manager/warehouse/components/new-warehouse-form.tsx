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
import { postData } from '@/funcs/post';
import { paths } from '@/lib/path';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { CreateWarehouseResult } from '../warehouse.dto';
export const NewWarehouseForm = ({
  setIsReset,
}: {
  setIsReset: Dispatch<SetStateAction<boolean>>;
}) => {
  const t = useTranslations('admin_warehouse_page.warehouse_new_form');
  const n = useTranslations('admin_notification');

  const [open, setOpen] = useState<boolean>(false);

  const formSchema = z.object({
    name: z.string().min(1, {
      message: t('t_name_schema'),
    }),
    location: z.string().nonempty(t('t_location_schema')),
    region: z.string().nonempty(t('t_region_schema')),
    storageAreaSize: z.number().min(1, t('t_storage_size_schema')),
    slotSize: z.number().min(1, t('t_slot_size_schema')),
    status: z.string().nonempty(t('t_status')),
    size: z.number().min(1, t('t_warehouse_size')),
  });
  type FormSchemaType = z.infer<typeof formSchema>;

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      region: '',
      location: '',
      storageAreaSize: 1,
      slotSize: 1,
      status: '',
      size: 1,
    },
  });

  async function onSubmit(values: FormSchemaType) {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('region', values.region);
      formData.append('location', values.location);
      formData.append('storageAreaSize', values.storageAreaSize.toString());
      formData.append('slotSize', values.slotSize.toString());
      formData.append('status', values.status);
      formData.append('size', values.size.toString());
      const data = await postData({
        url: paths.manager.warehouse.create,
        body: formData,
        contentType: undefined,
      });
      const res: CreateWarehouseResult = await data.json();
      console.log(res);
      if (res.success) {
        toast(n('t_action_noti'), {
          description: n('t_create_desc_noti'),
        });
        setTimeout(() => {
          setOpen(false);
          setIsReset((prev) => !prev);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to create category:', error);
      toast(n('t_action_failed_noti'), {
        description: n('t_create_failed_desc_noti'),
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => form.reset()}
          className="hover:cursor-pointer"
        >
          <IconPlus />
          {t('t_new_button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{t('t_new_warehouse')}</DialogTitle>
              <DialogDescription>{t('t_desc')}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 m-2">
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
                <Label htmlFor="location">{t('t_location')}</Label>
                <FormField
                  control={form.control}
                  name="location"
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

              <div className="w-full grid grid-cols-2 gap-3">
                <div className="w-full grid gap-3">
                  <Label htmlFor="region">{t('t_region')}</Label>
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Select
                            {...field}
                            name="region"
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger
                              className="flex w-fit @4xl/main:hidden"
                              size="sm"
                              id="active-1"
                            >
                              <SelectValue placeholder={t('t_region')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem
                                  value="NORTHERN_REGION"
                                  className="hover:cursor-pointer"
                                >
                                  {t('c_north')}
                                </SelectItem>
                                <SelectItem
                                  value="CENTRAL_REGION"
                                  className="hover:cursor-pointer"
                                >
                                  {t('c_central')}
                                </SelectItem>
                                <SelectItem
                                  value="SOURTHERN_REGION"
                                  className="hover:cursor-pointer"
                                >
                                  {t('c_sourth')}
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

                <div className="w-full grid gap-3">
                  <Label htmlFor="active-1">{t('t_status')}</Label>
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex-1 ">
                        <FormControl>
                          <Select
                            {...field}
                            name="status"
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
                                <SelectItem
                                  value="OPEN"
                                  className="hover:cursor-pointer"
                                >
                                  {t('c_open')}
                                </SelectItem>
                                <SelectItem
                                  value="CLOSED"
                                  className="hover:cursor-pointer"
                                >
                                  {t('c_closed')}
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
              <div className="w-full flex flex-row gap-3">
                <div className="">
                  <div className="grid gap-3">
                    <Label htmlFor="storageAreaSize">
                      {t('t_storage_size')}
                    </Label>
                    <FormField
                      control={form.control}
                      name="storageAreaSize"
                      render={({ field }) => (
                        <FormItem className="flex-1 ">
                          {' '}
                          <FormControl>
                            <Input {...field} className="" type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="">
                  <div className="grid gap-3">
                    <Label htmlFor="slotSize">{t('t_slot_size')}</Label>
                    <FormField
                      control={form.control}
                      name="slotSize"
                      render={({ field }) => (
                        <FormItem className="flex-1 ">
                          <FormControl>
                            <Input {...field} className="" type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="">
                <div className="grid gap-3">
                  <Label htmlFor="size">
                    {t('t_warehouse_size') + '(m2)'}{' '}
                  </Label>
                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem className="flex-1 ">
                        <FormControl>
                          <Input {...field} className="" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  onClick={() => form.reset()}
                  className="hover:cursor-pointer"
                >
                  {t('t_cancel_action')}
                </Button>
              </DialogClose>
              <Button type="submit" className="hover:cursor-pointer">
                {t('t_submit_action')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
