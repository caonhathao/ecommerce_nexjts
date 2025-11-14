'use client';
import { formatDay } from '@/app/(public)/_components/global-function';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  shopData,
  shopDetail,
  shopItemData,
  shopMember,
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
import React, { useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { FiXCircle } from 'react-icons/fi';
import { MdOutlineCopyAll } from 'react-icons/md';
import { toast } from 'sonner';
import SearchBar from '../_components/search-bar';
import TabShop from './_components/tab-shop';

const ShopsPage = () => {
  const [data, setData] = React.useState<shopData | null>(null);
  const [shopList, setShopList] = React.useState<shopItemData[]>([]);
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
    () => shopList?.map(({ id }) => id) || [],
    [shopList]
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setShopList((data) => {
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

  const handleCopy = (value: string | undefined) => {
    if (!value) {
      toast('Hành động', {
        description: 'Sao chép ID cửa hàng thất bại',
      });
    } else {
      navigator.clipboard
        .writeText(value)
        .then(() => {
          // 1. Set the copied ID
          setCopiedId(value);
          // 2. Clear the feedback after 2 seconds
          toast('Hành động', {
            description: 'Đã sao chép ID',
          });
          setTimeout(() => {
            setCopiedId(null);
          }, 2000);
        })
        .catch((err) => {
          console.error('Failed to copy ID: ', err);
        });
    }
  };

  const columns: ColumnDef<shopItemData>[] = [
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
      accessorKey: 'Tên cửa hàng',
      header: 'Tên cửa hàng',
      cell: ({ row }) => {
        return <TableCellViewer item={row.original} />;
      },
      enableHiding: false,
    },
    {
      accessorKey: 'Chủ sỡ hữu',
      header: 'Chủ sở hữu',
      cell: ({ row }) => (
        <div className="w-full flex flex-row gap-2 justify-start items-center">
          <Avatar>
            <AvatarImage src={row.original.owner.image} alt="shopLogo" />
            <AvatarFallback>UK</AvatarFallback>
          </Avatar>
          <div>{row.original.owner.name}</div>
        </div>
      ),
    },
    {
      accessorKey: 'Trạng thái',
      header: 'Trạng thái',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.status === 'SUSPENDED' ? (
            <FiXCircle className="fill-red-500 dark:fill-red-400" />
          ) : row.original.status === 'CLOSED' ? (
            <FaCheckCircle className="fill-amber-500-500 dark:fill-amber-400" />
          ) : row.original.status === 'ACTIVE' ? (
            <FaCheckCircle className="fill-green-500 dark:fill-green-400" />
          ) : (
            <IconLoader />
          )}
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'Điểm đánh giá',
      header: () => <div className="w-fit text-right">Đánh giá</div>,
      cell: ({ row }) => (
        <div className="w-full text-right">
          {row.original.ratingAvg + '(' + row.original.ratingCount + ')'}
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
                type="button"
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
    data: shopList,
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

  function TableCellViewer({ item }: { item: shopItemData }) {
    const isMobile = useIsMobile();
    const [detail, setDetail] = React.useState<shopDetail | null>(null);
    const [openIndex, setOpenIndex] = React.useState<number | null>(null);
    const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
    const [defaultStatus, setDefaultStatus] = React.useState<string>('');

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
    async function fetchDetail() {
      try {
        const response = await fetch(`/api/manager/shop/${item.id}`);
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
          setShopList((prev) => prev.filter((shop) => shop.id !== item.id));
        }
      } catch (e) {
        console.error(e);
      }
    };

    useEffect(() => {
      if (detail) {
        console.log('fetched');
        setDefaultStatus(detail.status);
      }
    }, [detail]);

    return (
      <Drawer direction={isMobile ? 'bottom' : 'right'}>
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
            <DrawerDescription>Thông tin chi tiết cửa hàng</DrawerDescription>
          </DrawerHeader>
          <div
            className="flex flex-col gap-4 overflow-y-auto px-4 text-sm"
            ref={scrollContainerRef}
          >
            <form className="flex flex-col gap-4">
              <div className="w-full flex justify-center items-center mb-3">
                {/* show cover image */}
                <div className="w-full relative">
                  <img
                    src={detail?.coverUrl}
                    alt="shop cover image"
                    className="w-full"
                  />
                  <div className="absolute left-5 -bottom-5">
                    <img
                      src={detail?.logoUrl}
                      alt="shop cover image"
                      className="w-10 rounded-full border border-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="shop">Cửa hàng</Label>
                <div className="w-full flex flex-row justify-between items-center gap-2">
                  <div className="flex flex-row justify-start items-center gap-2">
                    <Avatar>
                      <AvatarImage src={detail?.logoUrl} alt="shopLogo" />
                      <AvatarFallback>UK</AvatarFallback>
                    </Avatar>
                    <p>{detail?.name}</p>
                  </div>
                  <Button
                    variant={'outline'}
                    type="button"
                    onClick={() => handleCopy(detail?.id)}
                  >
                    Sao chép ID
                    <MdOutlineCopyAll />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="shop">Chủ sở hữu</Label>
                <div className="w-full flex flex-row justify-between items-center gap-2">
                  <div className="flex flex-row justify-start items-center gap-2">
                    <Avatar>
                      <AvatarImage src={detail?.owner.image} alt="shopLogo" />
                      <AvatarFallback>UK</AvatarFallback>
                    </Avatar>
                    <p>{detail?.owner.name}</p>
                  </div>
                  <Button
                    variant={'outline'}
                    type="button"
                    onClick={() => handleCopy(detail?.id)}
                  >
                    <MdOutlineCopyAll />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="title">Ngày tạo</Label>
                  <div className="w-full">{formatDay(detail?.createdAt)}</div>
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="status">Ngày cập nhật</Label>
                  <div className="flex flex-col gap-3">
                    <div className="w-full">{formatDay(detail?.updatedAt)}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="target">Điểm đánh giá</Label>
                  <div>{detail?.ratingAvg}</div>
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="limit">Tổng đánh giá</Label>
                  <div>{detail?.ratingCount}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="target">Email</Label>
                  <div>{detail?.contactEmail}</div>
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="limit">Điện thoại</Label>
                  <div>{detail?.contactPhone}</div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="visibility">Trạng thái</Label>
                <Select
                  value={defaultStatus}
                  onValueChange={(value) => setValue(value)}
                >
                  <SelectTrigger id="visibility" className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                    <SelectItem value="PENDING">Đang chờ</SelectItem>
                    <SelectItem value="SUSPENDED">Bị cấm</SelectItem>
                    <SelectItem value="CLOSED">Đóng cửa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="type">Mô tả</Label>
                <textarea defaultValue={detail?.description || ''} />
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="variants-list">Thành viên</Label>
                <div className="flex flex-col  gap-4">
                  <ul className="w-full flex flex-col gap-2 ">
                    {detail?.members.map((value: shopMember, index) => (
                      <li
                        id={`variant-item-${index}`}
                        className="flex flex-col gap-2"
                      >
                        <div className="w-full flex flex-row justify-between items-center">
                          <div className="flex flex-row justify-start items-center gap-2">
                            <p>
                              {index + 1}
                              {'. '}
                            </p>
                            <Avatar>
                              <AvatarImage
                                src={value.user.image}
                                alt="shopLogo"
                              />
                              <AvatarFallback>UK</AvatarFallback>
                            </Avatar>
                            <p>{value.user.name}</p>
                            <p>{'(' + value.role + ')'}</p>
                          </div>
                          <Button
                            variant={'outline'}
                            type="button"
                            onClick={() => handleCopy(value.id)}
                          >
                            <MdOutlineCopyAll />
                          </Button>
                        </div>
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

  function DraggableRow({ row }: { row: Row<shopItemData> }) {
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
        searchObject="shop"
        setData={setShopList}
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
            <TabsTrigger value="all-active">Đang hoạt động</TabsTrigger>
            <TabsTrigger value="all-pending">Đang chờ</TabsTrigger>
            <TabsTrigger value="all-suspended">Cấm</TabsTrigger>
            <TabsTrigger value="all-closed">Đóng cửa</TabsTrigger>
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
          <TabShop
            statusFilter=""
            isReset={isReset}
            sensors={sensors}
            sortableId={sortableId}
            table={table}
            columns={columns}
            data={data}
            setData={setData}
            shopList={shopList}
            setShopList={setShopList}
            dataIds={dataIds}
            DraggableRow={DraggableRow}
            handleDragEnd={handleDragEnd}
          />
        </TabsContent>
        <TabsContent value="all-active" className="flex flex-col px-4 lg:px-6">
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed">
            <TabShop
              statusFilter="ACTIVE"
              isReset={isReset}
              sensors={sensors}
              sortableId={sortableId}
              table={table}
              columns={columns}
              data={data}
              setData={setData}
              shopList={shopList}
              setShopList={setShopList}
              dataIds={dataIds}
              DraggableRow={DraggableRow}
              handleDragEnd={handleDragEnd}
            />
          </div>
        </TabsContent>
        <TabsContent value="all-pending" className="flex flex-col px-4 lg:px-6">
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed">
            <TabShop
              statusFilter="PENDING"
              isReset={isReset}
              sensors={sensors}
              sortableId={sortableId}
              table={table}
              columns={columns}
              data={data}
              setData={setData}
              shopList={shopList}
              setShopList={setShopList}
              dataIds={dataIds}
              DraggableRow={DraggableRow}
              handleDragEnd={handleDragEnd}
            />
          </div>
        </TabsContent>
        <TabsContent
          value="all-suspended"
          className="flex flex-col px-4 lg:px-6"
        >
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed">
            <TabShop
              statusFilter="SUSPENDED"
              isReset={isReset}
              sensors={sensors}
              sortableId={sortableId}
              table={table}
              columns={columns}
              data={data}
              setData={setData}
              shopList={shopList}
              setShopList={setShopList}
              dataIds={dataIds}
              DraggableRow={DraggableRow}
              handleDragEnd={handleDragEnd}
            />
          </div>
        </TabsContent>
         <TabsContent
          value="all-closed"
          className="flex flex-col px-4 lg:px-6"
        >
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed">
            <TabShop
              statusFilter="CLOSED"
              isReset={isReset}
              sensors={sensors}
              sortableId={sortableId}
              table={table}
              columns={columns}
              data={data}
              setData={setData}
              shopList={shopList}
              setShopList={setShopList}
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

export default ShopsPage;
