'use client';
import {
  formatDay,
  formatPrice,
} from '@/app/(public)/_components/global-function';
import { Loading } from '@/app/(public)/_components/loading';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  productData,
  productDetail,
  productItemData,
} from '@/types/manager.data-types';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
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
import { toast } from 'sonner';
import SearchBar from '../_components/search-bar';

const ProductsPage = () => {
  const [data, setData] = React.useState<productData | null>(null);
  const [productList, setProductList] = React.useState<productItemData[]>([]);
  const [copiedId, setCopiedId] = React.useState<string | null>('');

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
            <DropdownMenuItem className='flex justify-center items-center'>
              <Button
                variant={'ghost'}
                className='text-left'
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

    const [value, setValue] = React.useState<string>('');

    async function fetchDetail() {
      try {
        const response = await fetch(`/api/product/draft/${item.id}`);
        const detail = await response.json();
        // console.log(detail.data);
        setProductList(detail.data);
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
          <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
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
                  <Label htmlFor="limit">currency</Label>
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
                  defaultValue={detail?.visibility || 'PRIVATE'}
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
                  {detail?.variants.map((value, index) => (
                    <div className="w-full flex flex-col gap-4" key={index}>
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
                          <Label htmlFor="currency-variant">currency</Label>
                          <div>{value.currency}</div>
                        </div>
                      </div>
                      <Separator />
                    </div>
                  ))}
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

  const fetchData = async (page: number, limit: number) => {
    try {
      const response = await fetch(
        `/api/product/manage?page=${page}&&limit=${limit}&&visibility=`
      );
      const data = await response.json();

      console.log(data);
      setData(data);
      setProductList(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData(1, 10);
  }, []);

  useEffect(() => {
    console.log(productList);
  }, [productList]);

  if (!data || !productList) return <Loading />;

  return (
    <div className="w-full h-full p-3 flex flex-col justify-start items-center">
      <SearchBar searchObject="product" setData={setProductList} />
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
          <div className="overflow-hidden rounded-lg border">
            <DndContext
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
              sensors={sensors}
              id={sortableId}
            >
              <Table>
                <TableHeader className="bg-muted sticky top-0 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id} colSpan={header.colSpan}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody className="**:data-[slot=table-cell]:first:w-8">
                  {productList.length !== 0 ? (
                    <SortableContext
                      items={dataIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {table.getRowModel().rows.map((row) => (
                        <DraggableRow key={row.id} row={row} />
                      ))}
                    </SortableContext>
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </DndContext>
          </div>
          <div className="flex items-center justify-between px-4">
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
              {table.getFilteredSelectedRowModel().rows.length} of{' '}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Rows per page
                </Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                    fetchData(1, Number(value));
                  }}
                >
                  <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </div>
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => {
                    table.setPageIndex(0);
                    fetchData(1, 10);
                  }}
                  disabled={data.pagination.page - 1 <= 0}
                >
                  <span className="sr-only">Go to first page</span>
                  <IconChevronsLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => {
                    table.previousPage();
                    fetchData(data.pagination.page - 1, 10);
                  }}
                  disabled={data.pagination.page - 1 <= 0}
                >
                  <span className="sr-only">Go to previous page</span>
                  <IconChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => {
                    table.nextPage();
                    fetchData(data.pagination.page + 1, 10);
                  }}
                  disabled={
                    data.pagination.page + 1 > data.pagination.totalPages
                  }
                >
                  <span className="sr-only">Go to next page</span>
                  <IconChevronRight />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() => {
                    table.setPageIndex(table.getPageCount() - 1);
                    fetchData(data.pagination.totalPages, 10);
                  }}
                  disabled={
                    data.pagination.page + 1 > data.pagination.totalPages
                  }
                >
                  <span className="sr-only">Go to last page</span>
                  <IconChevronsRight />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent
          value="past-performance"
          className="flex flex-col px-4 lg:px-6"
        >
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
        </TabsContent>
        <TabsContent
          value="key-personnel"
          className="flex flex-col px-4 lg:px-6"
        >
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
        </TabsContent>
        <TabsContent
          value="focus-documents"
          className="flex flex-col px-4 lg:px-6"
        >
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductsPage;
