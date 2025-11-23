'use client';
import {
  formatDay,
  formatPrice,
} from '@/app/(public)/_components/global-function';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { TableCell, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { fetchData } from '@/funcs/fetch';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  productDataResponse,
  productDetail,
  productItemData,
  variantDetail,
} from '@/types/manager.data-types';
import {
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  IconChevronDown,
  IconDotsVertical,
  IconLayoutColumns,
} from '@tabler/icons-react';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { IoIosArrowUp } from 'react-icons/io';
import { toast } from 'sonner';
import TabProduct from './tab-product';

const TableTopProduct = () => {
  const [data, setData] = React.useState<productDataResponse | null>(null);
  const [productList, setProductList] = React.useState<productItemData[]>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => productList?.map(({ id }) => id) || [],
    [productList]
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setProductList((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const handleCopy = (value: string) => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        toast('Hành động', {
          description: 'Đã sao chép ID sản phẩm',
        });
      })
      .catch((err) => {
        console.error('Failed to copy ID: ', err);
      });
  };

  const columns: ColumnDef<productItemData>[] = [
    {
      accessorKey: 'title',
      header: 'Tên sản phẩm',
      cell: ({ row }) => {
        return <TableCellViewer item={row.original} />;
      },
      enableHiding: false,
    },
    {
      accessorKey: 'Cửa hàng',
      header: 'Cửa hàng',
      cell: ({ row }) => (
        <div className="w-full flex flex-row gap-2 justify-start items-center">
          <Avatar>
            <AvatarImage src={row.original.shop.logoUrl} alt="shopLogo" />
            <AvatarFallback>UK</AvatarFallback>
          </Avatar>
          <div>{row.original.shop.name}</div>
        </div>
      ),
    },
    {
      accessorKey: 'Lượt bán',
      header: () => <div className="w-fit text-right">Lượt bán</div>,
      cell: ({ row }) => (
        <div className="w-full text-right">
          {row.original.soldCount.toString()}
        </div>
      ),
    },
    {
      accessorKey: 'Ngày tạo',
      header: 'Ngày tạo',
      cell: ({ row }) => {
        return <div className="w-32">{formatDay(row.original.createdAt)}</div>;
      },
    },
    {
      accessorKey: 'Ngày sửa',
      header: 'Ngày sửa',
      cell: ({ row }) => {
        return <div className="w-32">{formatDay(row.original.updatedAt)}</div>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
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
                onClick={() => handleCopy(row.original.id)}
              >
                Sao chép ID
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: productList,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function TableCellViewer({ item }: { item: productItemData }) {
    const [open, setOpen] = useState<boolean>(false);
    const isMobile = useIsMobile();
    const [detail, setDetail] = React.useState<productDetail | null>(null);
    const [openIndex, setOpenIndex] = React.useState<number | null>(null);
    const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
    const [defaultVisibility, setDefaultVisibility] =
      React.useState<string>('');

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
        setDefaultVisibility(detail.visibility);
      }
    }, [detail]);

    async function fetchDetail() {
      try {
        const response = await fetchData({
          baseUrl: '/api/manager/product/query',
          params: { id: item.id },
          setData: undefined,
        });
        if (response) {
          //        console.log(detail.data);
          setDetail(response.data);
        }
      } catch (err) {
        console.error(err);
      }
    }

    const renderVariant = (index: number, value: variantDetail) => {
      return (
        <div
          className={`w-full flex flex-col gap-4 
      ${openIndex === index ? 'max-h-[500px]' : 'max-h-0'}
      transition-[max-height] duration-300 ease-in-out
      overflow-hidden`}
          key={index}
        >
          <div className="w-full flex justify-center items-center">
            <Image
              src={value.image}
              alt={value.image || index.toString()}
              width={0}
              height={0}
              className="w-[50%]"
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="name">Tên sản phẩm</Label>
              <div className="w-full">{value.name}</div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="sku">Mã SKU</Label>
              <div className="w-full">{value.sku}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="price">Giá</Label>
              <div>{formatPrice(Number(value.price))}</div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="currency-variant">Đơn vị tiền tệ</Label>
              <div>{value.currency}</div>
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
            onClick={() => {
              fetchDetail();
            }}
          >
            {item.title}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="gap-1">
            <DrawerTitle>{detail?.title || 'unknown'}</DrawerTitle>
            <DrawerDescription>Thông tin chi tiết sản phẩm</DrawerDescription>
          </DrawerHeader>
          <div
            className="flex flex-col gap-4 overflow-y-auto px-4 text-sm"
            ref={scrollContainerRef}
          >
            <form className="flex flex-col gap-4">
              <div className="w-full flex justify-center items-center">
                <Carousel className="w-[70%] max-w-lg">
                  <CarouselContent>
                    {detail?.images?.map((img, index) => (
                      <CarouselItem key={index}>
                        <div className="p-1">
                          <Card className="w-full h-64 overflow-hidden">
                            <CardContent className="relative w-full h-full p-0">
                              <Image
                                src={img.url}
                                alt={img.alt || `Product image ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 500px"
                                priority={index === 0}
                              />
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="shop">Cửa hàng</Label>
                <div className="w-full flex flex-row justify-between items-center gap-2">
                  <div className="flex flex-row justify-start items-center gap-2">
                    <Avatar>
                      <AvatarImage src={detail?.shop.logoUrl} alt="shopLogo" />
                      <AvatarFallback>UK</AvatarFallback>
                    </Avatar>
                    <p>{detail?.shop.name}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant={'outline'}>
                        <BsThreeDotsVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Xem cửa hàng</DropdownMenuItem>
                      <DropdownMenuItem>Sao chép ID</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="title">Tên sản phẩm</Label>
                  <div className="w-full">{detail?.title}</div>
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="status">URL-friendly</Label>
                  <div className="flex flex-col gap-3">
                    <div className="w-full">{detail?.slug}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="target">Xuất xứ</Label>
                  <div>{detail?.origin}</div>
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="limit">Đơn vị tiền tệ</Label>
                  <div>{detail?.currency}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="target">Giá tối thiểu</Label>
                  <div>{formatPrice(Number(detail?.minPrice))}</div>
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="limit">Giá tối đa</Label>
                  <div>{formatPrice(Number(detail?.maxPrice))}</div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="visibility">Hiển thị</Label>
                <Select value={defaultVisibility}>
                  <SelectTrigger id="visibility" className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNLISTED">Không cho phép</SelectItem>
                    <SelectItem value="PRIVATE">Đang xin phép</SelectItem>
                    <SelectItem value="PUBLIC">Cho phép</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="type">Mô tả</Label>
                <textarea defaultValue={detail?.description || ''} />
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="variants-list">Phiên bản</Label>
                <div className="flex flex-col  gap-4">
                  <ul className="w-full flex flex-col gap-2 ">
                    {detail?.variants.map((value: variantDetail, index) => (
                      <li
                        id={`variant-item-${index}`}
                        className="flex flex-col gap-2"
                        key={value.id || index}
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
                              setOpenIndex(openIndex !== index ? index : null)
                            }
                            type="button"
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
                    ))}
                  </ul>
                </div>
              </div>
            </form>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Done</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  function DraggableRow({ row }: { row: Row<productItemData> }) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
      id: row.original.id,
    });

    return (
      <TableRow
        data-state={row.getIsSelected() && 'selected'}
        data-dragging={isDragging}
        ref={setNodeRef}
        className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
        style={{
          transform: CSS.Transform.toString(transform),
          transition: transition,
        }}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    );
  }

  return (
    <div className="w-full h-full p-3 flex flex-col justify-start items-center">
      <Tabs
        defaultValue="all-status"
        className="w-full flex-col justify-start gap-6"
      >
        <div className="flex items-center justify-between px-4 lg:px-6">
          <Label htmlFor="view-selector" className="sr-only">
            View
          </Label>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns />
                  <span className="hidden lg:inline">Hiển thị</span>
                  <span className="lg:hidden">Cột</span>
                  <IconChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== 'undefined' &&
                      column.getCanHide()
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <TabsContent
          value="all-status"
          className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
        >
          <TabProduct
            visibilityFilter="PUBLIC"
            sensors={sensors}
            sortableId={sortableId}
            table={table}
            columns={columns}
            data={data}
            setData={setData}
            productList={productList}
            setProductList={setProductList}
            dataIds={dataIds}
            DraggableRow={DraggableRow}
            handleDragEnd={handleDragEnd}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TableTopProduct;
