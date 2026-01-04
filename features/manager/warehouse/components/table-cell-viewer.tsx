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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { fetchData } from '@/funcs/fetch';
import { putData } from '@/funcs/put';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useIsMobile } from '@/hooks/use-mobile';
import { paths } from '@/lib/path';
import { formatDay } from '@/lib/utils';
import {
  storageAreaDetail,
  warehouseData,
  warehouseDetail,
} from '@/types/manager.data-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import React, { SetStateAction, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FaCheckCircle } from 'react-icons/fa';
import { FiXCircle } from 'react-icons/fi';
import { IoIosArrowUp } from 'react-icons/io';
import { MdOutlineCopyAll } from 'react-icons/md';
import { toast } from 'sonner';
import z from 'zod';

export function TableCellViewer({
  item,
  setIsReset,
}: {
  item: warehouseData;
  setIsReset: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const isMobile = useIsMobile();
  const [detail, setDetail] = React.useState<warehouseDetail | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = React.useState<boolean>(false);
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const t = useTranslations('admin_warehouse_page.warehouse_drawer');
  const n = useTranslations('admin_notification');
  const s = useTranslations('admin_warehouse_page.warehouse_schema');
  const handleCopy = useCopyToClipboard({ t: n });

  const formSchema = z.object({
    id: z.string(),
    name: z.string().min(1, {
      message: s('t_name_schema'),
    }),
    street: z.string().min(1, { message: s('t_street_schema') }),
    ward: z.string().min(1, { message: s('t_ward_schema') }),
    district: z.string().min(1, {
      message: s('t_district_schema'),
    }),
    city: z.string().min(1, {
      message: s('t_city_schema'),
    }),
    // Sử dụng coerce để tự động chuyển string từ input sang number
    size: z.string().nonempty({
      message: s('t_size_schema'),
    }),
    totalStorageArea: z.string().nonempty({
      message: s('t_storage_size_schema'),
    }),
    totalSlot: z.string().nonempty({
      message: s('t_slot_size_schema'),
    }),
    region: z.string().min(1, {
      message: s('t_region_schema'),
    }),
    status: z.string().min(1, {
      message: s('t_status_schema'),
    }),
    // Định nghĩa mảng storageArea theo interface
    storageArea: z.array(
      z.object({
        name: z.string().min(1, {
          message: s('t_name_schema'),
        }),
        type: z.string().min(1, {
          message: s('t_type_schema'),
        }),
        status: z.string().min(1, {
          message: s('t_status_schema'),
        }),
        totalSlots: z.string().min(1, {
          message: s('t_slot_size_schema'),
        }),
        totalRows: z.string().min(1, {
          message: s('t_row_size_schema'),
        }),
        totalFloors: z.string().min(1, {
          message: s('t_floor_size_schema'),
        }),
      })
    ),
  });

  type FormSchemaType = z.infer<typeof formSchema>;
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      name: '',
      street: '',
      ward: '',
      district: '',
      city: '',
      region: '',
      totalStorageArea: '',
      totalSlot: '',
      status: '',
      size: '',
      storageArea: [],
    },
  });

  async function fetchDetail() {
    try {
      const res = await fetchData({
        baseUrl: paths.manager.warehouse.fetch_detail,
        params: { id: item.id },
        setData: undefined,
        cacheType: 'default',
      });
      // console.log(res);
      if (res.success) {
        setDetail(res.data);
      } else {
        toast(n('t_process_failed_noti'), {
          description: n(res.message),
        });
      }
    } catch (err) {
      console.error(err);
      toast(n('t_process_failed_noti'), {
        description: n('t_conn_failed_desc_noti'),
      });
    }
  }

  async function handleSubmit(values: FormSchemaType) {
    if (
      isNaN(Number(values.totalSlot)) ||
      isNaN(Number(values.totalStorageArea)) ||
      isNaN(Number(values.size))
    ) {
      toast(n('t_action_noti'), {
        description: n('t_number_invalid'),
      });
      return;
    }
    if (Number(values.totalSlot) < Number(values.totalStorageArea)) {
      toast(n('t_action_noti'), {
        description: n('t_slot_invalid'),
      });
      return;
    }

    // check validation of storageArea array
    values.storageArea.forEach((item, index) => {
      if (
        isNaN(Number(item.totalSlots)) ||
        isNaN(Number(item.totalRows)) ||
        isNaN(Number(item.totalFloors))
      ) {
        toast(n('t_action_noti'), {
          description: n('t_number_invalid'),
        });
        return;
      }
    });

    try {
      const formData = new FormData();
      formData.append('id', values.id);
      formData.append('name', values.name);
      formData.append('street', values.street);
      formData.append('ward', values.ward);
      formData.append('district', values.district);
      formData.append('city', values.city);
      formData.append('region', values.region);
      formData.append('size', values.size.toString());
      formData.append('totalStorageArea', values.totalStorageArea.toString());
      formData.append('totalSlot', values.totalSlot.toString());
      formData.append('status', values.status);
      formData.append('storageArea', JSON.stringify(values.storageArea));

      const data = await putData({
        url: paths.manager.warehouse.update,
        body: formData,
        t: t,
      });
      if (data.status === 200) {
        toast(t('t_action_noti'), {
          description: t('t_update_desc_noti'),
        });
        setTimeout(() => {
          setOpen(false);
          setIsReset((prev) => !prev);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to update warehouse:', error);
      toast(t('t_action_failed_noti'), {
        description: t('t_update_failed_desc_noti'),
      });
    }
  }

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
      form.reset({
        id: detail.id,
        name: detail.name,
        street: detail.street,
        ward: detail.ward,
        district: detail.district,
        city: detail.city,
        region: detail.region,
        size: detail.size.toString(),
        totalStorageArea: detail.totalStorageArea.toString(),
        totalSlot: detail.totalSlot.toString(),
        status: detail.status,
        storageArea: detail.storageArea,
      });
    }
  }, [detail, form]);

  const renderVariant = (index: number, value: storageAreaDetail) => {
    const filedName = `storageArea.${index}` as const;
    return (
      <div
        className={`w-full flex flex-col gap-4 
        ${openIndex === index ? 'max-h-[500px]' : 'max-h-0'}
        transition-[max-height] duration-300 ease-in-out
        overflow-hidden`}
        key={index}
      >
        <div className="flex flex-col gap-3">
          <Label htmlFor={`${filedName}.name`}>{t('t_storage_name')}</Label>
          <FormField
            name={`${filedName}.name`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    {...field}
                    defaultValue={value.name}
                    placeholder={t('t_storage_name')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* type and status storage */}
        <div className="grid grid-rows-1 grid-cols-2 gap-2">
          <div className="flex flex-col gap-3">
            <Label htmlFor={`${filedName}.type`}>{t('t_storage_type')}</Label>
            <FormField
              name={`${filedName}.type`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('t_type')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GENERAL_STORAGE">
                        {t('c_general')}
                      </SelectItem>
                      <SelectItem value="COLD_STORAGE">
                        {t('c_cold')}
                      </SelectItem>
                      <SelectItem value="ELECTRICAL_EQUIPMENT">
                        {t('c_electrical')}
                      </SelectItem>
                      <SelectItem value="DRY_STORAGE">{t('c_dry')}</SelectItem>
                      <SelectItem value="HAZARDOUS_MATERIALS">
                        {t('c_hazardous')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor={`${filedName}.status`}>
              {t('t_storage_status')}
            </Label>
            <FormField
              name={`${filedName}.status`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('t_status')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="OPEN">{t('c_open')}</SelectItem>
                      <SelectItem value="CLOSED">{t('c_closed')}</SelectItem>
                      <SelectItem value="FULL">{t('c_full')}</SelectItem>
                      <SelectItem value="UNDER_MAINTENANCE">
                        {t('c_maintenance')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        {/* Storage specification for storing */}
        <div className="grid gap-3">
          <Label htmlFor="specification">{t('t_specifications')}</Label>
          <div className="grid grid-rows-1 grid-cols-3 gap-3">
            <div className="grid gap-3">
              <Label htmlFor={`${filedName}.totalSlots`}>
                {t('c_total_slots')}
              </Label>
              <FormField
                name={`${filedName}.totalSlots`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input {...field} placeholder={t('c_total_slots')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor={`${filedName}.totalRows`}>
                {t('c_total_rows')}
              </Label>
              <FormField
                name={`${filedName}.totalRows`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input {...field} placeholder={t('c_total_rows')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor={`${filedName}.totalFloors`}>
                {t('c_total_floors')}
              </Label>
              <FormField
                name={`${filedName}.totalFloors`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input {...field} placeholder={t('c_total_floors')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
          className="text-foreground w-fit px-0 text-left hover:cursor-pointer"
          onClick={fetchDetail}
        >
          {item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="min-w-[425px]">
        <DrawerHeader className="gap-1">
          <DrawerTitle>{detail?.name || 'unknown'}</DrawerTitle>
          <DrawerDescription>{t('t_warehouse_desc')}</DrawerDescription>
        </DrawerHeader>
        <div
          className="flex flex-col gap-4 overflow-y-auto px-4 text-sm"
          ref={scrollContainerRef}
        >
          <Form {...form}>
            <form
              id="form-edit-warehouse"
              className="flex flex-col gap-4"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <div className="flex flex-col gap-3">
                {/* Basic Information */}
                <div className="grid gap-3">
                  <Label htmlFor="name">{t('t_name')}</Label>
                  <FormField
                    name="name"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t('t_name_placeholder')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* Warehouse ID */}
                <div className="flex flex-col gap-3">
                  <Label htmlFor="warehouseId">{t('t_warehouse_id')}</Label>
                  <div className="flex flex-row justify-between items-center gap-2">
                    <p className="font-mono text-sm">{detail?.id || item.id}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => handleCopy(detail?.id || item.id)}
                    >
                      <MdOutlineCopyAll />
                    </Button>
                  </div>
                </div>

                {/* Address Information */}
                <div className="grid grid-cols-1 grid-rows-2 gap-3">
                  <Label>{t('t_address')}</Label>
                  <div className="">
                    <FormField
                      name="street"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="street">{t('t_street')}</Label>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t('t_street_placeholder')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 grid-rows-1 gap-3">
                    <div className="grid gap-3">
                      <FormField
                        name="ward"
                        render={({ field }) => (
                          <FormItem>
                            <Label htmlFor="ward">{t('t_ward')}</Label>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t('t_ward_placeholder')}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="district"
                        render={({ field }) => (
                          <FormItem>
                            <Label htmlFor="district">{t('t_district')}</Label>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t('t_district_placeholder')}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-3">
                      <FormField
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <Label htmlFor="city">{t('t_city')}</Label>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t('t_city_placeholder')}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="region"
                        render={({ field }) => (
                          <FormItem>
                            <Label htmlFor="region">{t('t_region')}</Label>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t('t_region_placeholder')}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Warehouse Specifications */}
                <div className="grid grid-cols-1 grid-rows-2 gap-3">
                  <Label>{t('t_specifications')}</Label>
                  <FormField
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="size">{t('t_size')}</Label>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t('t_size_placeholder')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      name="totalStorageArea"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="totalStorageArea">
                            {t('t_total_storage_area')}
                          </Label>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t('t_total_storage_area')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="totalSlot"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="totalSlot">{t('t_total_slot')}</Label>
                          <FormControl>
                            <Input {...field} placeholder={t('t_total_slot')} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="grid grid-cols-1 grid-rows-2 gap-3">
                  <Label>{t('t_status')}</Label>
                  <FormField
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="status">{t('t_status')}</Label>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('t_status')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="OPEN">{t('c_open')}</SelectItem>
                            <SelectItem value="CLOSED">
                              {t('c_closed')}
                            </SelectItem>
                            <SelectItem value="FULL">{t('c_full')}</SelectItem>
                            <SelectItem value="UNDER_MAINTENANCE">
                              {t('c_maintenance')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Storage Areas */}
                <div className="flex flex-col gap-3">
                  <Label>{t('t_storage_areas')}</Label>
                  <div className="flex flex-col  gap-4">
                    <ul className="w-full flex flex-col gap-2 ">
                      {detail?.storageArea.map(
                        (value: storageAreaDetail, index) => (
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
                                className="hover:cursor-pointer"
                              >
                                <div
                                  className={`${
                                    openIndex !== index
                                      ? `transform-[rotate(180deg)]`
                                      : `transform-[rotate(0deg)]`
                                  } transition ease-in-out`}
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
                </div>
              </div>
            </form>
          </Form>
        </div>
        <DrawerFooter>
          <Button
            type="submit"
            form="form-edit-warehouse"
            className="hover:cursor-pointer"
          >
            {t('t_submit_action')}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="hover:cursor-pointer">
              {t('t_cancel_action')}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
