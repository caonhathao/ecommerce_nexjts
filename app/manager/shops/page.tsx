'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { TableCell, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { paths } from '@/lib/path';
import { shopDataResponse, shopItemData } from '@/types/manager.data-types';
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
import { useTranslations } from 'next-intl';
import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { FiXCircle } from 'react-icons/fi';
import { toast } from 'sonner';
import SearchBar from '../_components/search-bar';
import TabShop from './_components/tab-shop';
import { TableCellViewer } from './_components/table-cell-viewer';
import { formatDay } from '@/lib/utils';

const ShopsPage = () => {
  const [data, setData] = React.useState<shopDataResponse | null>(null);
  const [shopList, setShopList] = React.useState<shopItemData[]>([]);
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

  const t = useTranslations('admin_shop_page');
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
      toast(t('t_action_failed_noti'), {
        description: t('t_copy_failed_desc_noti'),
      });
    } else {
      navigator.clipboard
        .writeText(value)
        .then(() => {
          toast(t('t_action_noti'), {
            description: t('t_copy_desc_noti'),
          });
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
      accessorKey: t('t_shop_name'),
      header: t('t_shop_name'),
      cell: ({ row }) => {
        return (
          <TableCellViewer
            item={row.original}
            handleCopy={handleCopy}
            setShopList={setShopList}
          />
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: t('t_owner_name'),
      header: t('t_owner_name'),
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
      accessorKey: t('t_status'),
      header: t('t_status'),
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
      accessorKey: t('t_rating'),
      header: () => <div className="w-fit text-right">{t('t_rating')}</div>,
      cell: ({ row }) => (
        <div className="w-full text-right">
          {row.original.ratingAvg + '(' + row.original.ratingCount + ')'}
        </div>
      ),
    },
    {
      accessorKey: t('t_created_at'),
      header: t('t_created_at'),
      cell: ({ row }) => {
        return <div className="w-32">{formatDay(row.original.createdAt)}</div>;
      },
    },
    {
      accessorKey: t('t_updated_at'),
      header: t('t_updated_at'),
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
                {t('t_copy_action')}
              </Button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              {t('t_del_action')}
            </DropdownMenuItem>
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
        baseUrl={paths.manager.shop.search}
        placeholder={t('t_search_placeholder')}
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
              <SelectItem value="all-status">{t('t_tab_all')}</SelectItem>
              <SelectItem value="all-active">{t('t_tab_active')}</SelectItem>
              <SelectItem value="all-pending">{t('t_tab_pending')}</SelectItem>
              <SelectItem value="all-suspended">
                {t('t_tab_suspended')}
              </SelectItem>
              <SelectItem value="all-closed">{t('t_tab_closed')}</SelectItem>
            </SelectContent>
          </Select>
          <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
            <TabsTrigger value="all-status">{t('t_tab_all')}</TabsTrigger>
            <TabsTrigger value="all-active">{t('t_tab_active')}</TabsTrigger>
            <TabsTrigger value="all-pending">{t('t_tab_pending')}</TabsTrigger>
            <TabsTrigger value="all-suspended">
              {t('t_tab_suspended')}
            </TabsTrigger>
            <TabsTrigger value="all-closed">{t('t_tab_closed')}</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns />
                  <span className="hidden lg:inline">{t('t_showing')}</span>
                  <span className="lg:hidden">{t('t_column')}</span>
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
        <TabsContent value="all-closed" className="flex flex-col px-4 lg:px-6">
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
