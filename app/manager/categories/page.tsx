'use client';
import { formatDay } from '@/app/(public)/_components/global-function';
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
  categoryChildDetail,
  categoryDataResponse,
  categoryDetail,
  categoryItemData,
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
import { IoIosArrowUp } from 'react-icons/io';
import { toast } from 'sonner';
import SearchBar from '../_components/search-bar';
import TabCategory from './_components/tab-category';

const CategoryManagePage = () => {
  const [data, setData] = React.useState<categoryDataResponse | null>(null);

  const [categoryList, setCategoryList] = React.useState<categoryItemData[]>(
    []
  );
  const [copiedId, setCopiedId] = React.useState<string | null>('');
  const [isReset, SetIsReset] = React.useState<boolean>(false);
  const [defaultActive, setDefaultActive] = React.useState<string>('true');

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
    () => categoryList?.map(({ id }) => id) || [],
    [categoryList]
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setCategoryList((data) => {
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

  const columns: ColumnDef<categoryItemData>[] = [
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
      accessorKey: 'Tên danh mục',
      header: 'Tên danh mục',
      cell: ({ row }) => {
        return <TableCellViewer item={row.original} />;
      },
      enableHiding: false,
    },
    {
      accessorKey: 'Thứ tự',
      header: 'Thứ tự',
      cell: ({ row }) => (
        <div className="w-full flex flex-row gap-2 justify-start items-center">
          <div>{row.original.position}</div>
        </div>
      ),
    },
    {
      accessorKey: 'Hiển thị',
      header: 'Hiển thị',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.isActive === false ? (
            <FiXCircle className="fill-red-500 dark:fill-red-400" />
          ) : (
            <FaCheckCircle className="fill-green-500 dark:fill-green-400" />
          )}
          {row.original.isActive ? 'Có' : 'Không'}
        </Badge>
      ),
    },
    {
      accessorKey: 'Số danh mục con',
      header: () => <div className="w-fit text-right">Số danh mục con</div>,
      cell: ({ row }) => (
        <div className="w-full text-right">
          {row.original._count.children.toString()}
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
    data: categoryList,
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

  function TableCellViewer({ item }: { item: categoryItemData }) {
    const isMobile = useIsMobile();
    const [detail, setDetail] = React.useState<categoryDetail | null>(null);
    const [openIndex, setOpenIndex] = React.useState<number | null>(null);
    const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);

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
        setDefaultActive(detail.isActive.toString());
      }
    }, [detail]);

    async function fetchDetail() {
      try {
        const response = await fetch(
          `/api/manager/category/query?id=${item.id}`
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
          setCategoryList((prev) =>
            prev.filter((category) => category.id !== item.id)
          );
        }
      } catch (e) {
        console.error(e);
      }
    };

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
              <Label htmlFor="name">Tên sản phẩm</Label>
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
                    Sao chép ID
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
            <DrawerDescription>Thông tin chi tiết danh mục</DrawerDescription>
          </DrawerHeader>
          <div
            className="flex flex-col gap-4 overflow-y-auto px-4 text-sm"
            ref={scrollContainerRef}
          >
            <form className="flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="title">Tên danh mục</Label>
                  <div className="w-full">{detail?.name}</div>
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="status">URL-friendly</Label>
                  <div className="flex flex-col gap-3">
                    <div className="w-full">{detail?.slug}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="visibility">Hiển thị</Label>
                <Select
                  value={defaultActive}
                  onValueChange={(value) => setValue(value)}
                >
                  <SelectTrigger id="visibility" className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Hiển thị</SelectItem>
                    <SelectItem value="false">Ẩn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="target">Danh mục cha</Label>
                  {detail?.parent ? (
                    <div className="flex flex-row justify-between items-center gap-4">
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="name">Tên danh mục</Label>
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
                              Sao chép ID
                            </Button>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    <div>Không có danh mục cha</div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="variants-list">Danh mục con</Label>
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
                  <div>Không có danh mục con</div>
                )}
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

  function DraggableRow({ row }: { row: Row<categoryItemData> }) {
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

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <div className="w-full h-full p-3 flex flex-col justify-start items-center">
      <SearchBar
        baseUrl="/api/manager/category/search"
        setData={setCategoryList}
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
              <SelectItem value="all-active">Hiện</SelectItem>
              <SelectItem value="all-inactive">Ẩn</SelectItem>
            </SelectContent>
          </Select>
          <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
            <TabsTrigger value="all-status">Tất cả</TabsTrigger>
            <TabsTrigger value="all-active">Hiện</TabsTrigger>
            <TabsTrigger value="all-inactive">Ẩn</TabsTrigger>
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
          <TabCategory
            activeFilter=""
            isReset={isReset}
            sensors={sensors}
            sortableId={sortableId}
            table={table}
            columns={columns}
            data={data}
            setData={setData}
            categoryList={categoryList}
            setCategoryList={setCategoryList}
            dataIds={dataIds}
            DraggableRow={DraggableRow}
            handleDragEnd={handleDragEnd}
          />
        </TabsContent>
        <TabsContent
          value="all-active"
          className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
        >
          <TabCategory
            activeFilter="true"
            isReset={isReset}
            sensors={sensors}
            sortableId={sortableId}
            table={table}
            columns={columns}
            data={data}
            setData={setData}
            categoryList={categoryList}
            setCategoryList={setCategoryList}
            dataIds={dataIds}
            DraggableRow={DraggableRow}
            handleDragEnd={handleDragEnd}
          />
        </TabsContent>
        <TabsContent
          value="all-inactive"
          className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
        >
          <TabCategory
            activeFilter="false"
            isReset={isReset}
            sensors={sensors}
            sortableId={sortableId}
            table={table}
            columns={columns}
            data={data}
            setData={setData}
            categoryList={categoryList}
            setCategoryList={setCategoryList}
            dataIds={dataIds}
            DraggableRow={DraggableRow}
            handleDragEnd={handleDragEnd}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CategoryManagePage;
