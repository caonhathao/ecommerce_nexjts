'use client';
import {
  formatDay,
  formatPrice,
} from '@/app/(public)/_components/global-function';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Checkbox } from '@/components/ui/checkbox';
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
  DropdownMenuSeparator,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  productData,
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
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
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
import React, { useEffect } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FaCheckCircle } from 'react-icons/fa';
import { FiXCircle } from 'react-icons/fi';
import { IoIosArrowUp } from 'react-icons/io';
import { toast } from 'sonner';
import SearchBar from '../_components/search-bar';
import TabProduct from './_components/tab-product';

const ProductsPage = () => {
  const [data, setData] = React.useState<productData | null>(null);
  const [productList, setProductList] = React.useState<productItemData[]>([]);
  const [copiedId, setCopiedId] = React.useState<string | null>('');
  const [isReset, SetIsReset] = React.useState<boolean>(false);

  const [rowSelection, setRowSelection] = React.useState({});
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
        // 1. Set the copied ID
        setCopiedId(value);
        // 2. Clear the feedback after 2 seconds
        toast('Hành động', {
          description: 'Đã sao chép ID sản phẩm',
        });
        setTimeout(() => {
          setCopiedId(null);
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to copy ID: ', err);
      });
  };

  const columns: ColumnDef<productItemData>[] = [
    {
      id: 'drag',
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
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
      accessorKey: 'Hiển thị',
      header: 'Hiển thị',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.visibility === 'UNLISTED' ? (
            <FiXCircle className="fill-red-500 dark:fill-red-400" />
          ) : row.original.visibility === 'PUBLIC' ? (
            <FaCheckCircle className="fill-green-500 dark:fill-green-400" />
          ) : (
            <IconLoader />
          )}
          {row.original.visibility}
        </Badge>
      ),
    },
    {
      accessorKey: 'Tổng phiên bản',
      header: () => <div className="w-fit text-right">Tổng phiên bản</div>,
      cell: ({ row }) => (
        <div className="w-full text-right">
          {row.original._count.variants.toString()}
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
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
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
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
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

  function DragHandle({ id }: { id: string }) {
    const { attributes, listeners } = useSortable({
      id,
    });

    return (
      <Button
        {...attributes}
        {...listeners}
        variant="ghost"
        size="icon"
        className="text-muted-foreground size-7 hover:bg-transparent"
      >
        <IconGripVertical className="text-muted-foreground size-3" />
        <span className="sr-only">Drag to reorder</span>
      </Button>
    );
  }

  function TableCellViewer({ item }: { item: productItemData }) {
    const isMobile = useIsMobile();
    const [detail, setDetail] = React.useState<productDetail | null>(null);
    const [openIndex, setOpenIndex] = React.useState<number | null>(null);
    const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
    const [defaultVisibility, setDefaultVisibility] =
      React.useState<string>('');

    const [value, setValue] = React.useState<string>('');

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
        const response = await fetch(
          `/api/manager/product/query?id=${item.id}`
        );
        const detail = await response.json();
        console.log(detail.data);
        setDetail(detail.data);
      } catch (err) {
        console.error(err);
      }
    }

    const handleSubmit = async (value: string) => {
      try {
        const response = await fetch(`/api/product/draft/${item.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visibility: value }),
        });
        if (response.status === 200) {
          toast('Đã cập nhật sản phẩm', {
            description: 'Sản phẩm được cấp phép hiển thị',
          });
          setProductList((prev) =>
            prev.filter((product) => product.id !== item.id)
          );
        }
      } catch (e) {
        console.error(e);
      }
    };

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
            <img
              src={value.image}
              alt={value.image || index.toString()}
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
      <Drawer direction={isMobile ? 'bottom' : 'right'}>
        <DrawerTrigger asChild>
          <Button
            variant="link"
            className="text-foreground w-fit px-0 text-left"
            onClick={fetchDetail}
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
                <Select
                  value={defaultVisibility}
                  onValueChange={(value) => setValue(value)}
                >
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
                              setOpenIndex(openIndex !== index ? index : null)
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
                    ))}
                  </ul>
                </div>
              </div>
            </form>
          </div>
          <DrawerFooter>
            <Button onClick={() => handleSubmit(value)}>Submit</Button>
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
      <SearchBar
        baseUrl="/api/manager/product/search"
        setData={setProductList}
        setIsReset={SetIsReset}
        isReset={isReset}
      />
      <Tabs
        defaultValue="all-status"
        className="w-full flex-col justify-start gap-6"
      >
        <div className="flex items-center justify-between px-4 lg:px-6">
          <Label htmlFor="view-selector" className="sr-only">
            View
          </Label>
          <Select defaultValue="all-status">
            <SelectTrigger
              className="flex w-fit @4xl/main:hidden"
              size="sm"
              id="view-selector"
            >
              <SelectValue placeholder="Select a view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-status">Tất cả</SelectItem>
              <SelectItem value="all-public">Công khai</SelectItem>
              <SelectItem value="all-private">Ẩn</SelectItem>
              <SelectItem value="all-unlisted">Cấm</SelectItem>
            </SelectContent>
          </Select>
          <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
            <TabsTrigger value="all-status">Tất cả</TabsTrigger>
            <TabsTrigger value="all-public">Công khai</TabsTrigger>
            <TabsTrigger value="all-private">Ẩn</TabsTrigger>
            <TabsTrigger value="all-unlisted">Cấm</TabsTrigger>
          </TabsList>
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
            <Button variant="outline" size="sm">
              <IconPlus />
              <span className="hidden lg:inline">Add Section</span>
            </Button>
          </div>
        </div>
        <TabsContent
          value="all-status"
          className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
        >
          <TabProduct
            visibilityFilter=""
            isReset={isReset}
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
        <TabsContent value="all-public" className="flex flex-col px-4 lg:px-6">
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed">
            <TabProduct
              visibilityFilter="PUBLIC"
              isReset={isReset}
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
          </div>
        </TabsContent>
        <TabsContent value="all-private" className="flex flex-col px-4 lg:px-6">
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed">
            <TabProduct
              visibilityFilter="PRIVATE"
              isReset={isReset}
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
          </div>
        </TabsContent>
        <TabsContent
          value="all-unlisted"
          className="flex flex-col px-4 lg:px-6"
        >
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed">
            <TabProduct
              visibilityFilter="UNLISTED"
              isReset={isReset}
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductsPage;
