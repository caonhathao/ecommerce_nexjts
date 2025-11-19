'use client';
import { Loading } from '@/app/(public)/_components/loading';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fetchData } from '@/funcs/fetch';
import { userDataResponse, userItemData } from '@/types/manager.data-types';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  SensorDescriptor,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from '@tabler/icons-react';
import {
  ColumnDef,
  flexRender,
  Row,
  Table as TanstackTable,
} from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import React, { Dispatch, SetStateAction, useEffect } from 'react';

/**
 * @interface tabProductProps
 * Defines the complete set of props required by the TabProduct component.
 */
interface tabShopProps {
  /** The current visibility filter string (e.g., "PUBLIC", "PRIVATE"). */
  statusFilter: string;

  /** Check the reset state: If reset data is called, change reset state */
  isReset: boolean;

  /** Array of sensor descriptors from dnd-kit for enabling drag-and-drop. */
  sensors: SensorDescriptor<any>[];

  /** A unique string ID passed to the SortableContext. */
  sortableId: string;

  /** The table instance object returned from `useReactTable`. */
  table: TanstackTable<userItemData>;

  /** The column definitions used to build the table. */
  columns: ColumnDef<userItemData>[];

  /** The complete data object from the API, including pagination. */
  data: userDataResponse | null;

  /** The React state setter for the `data` object. */
  setData: Dispatch<SetStateAction<userDataResponse | null>>;

  /** The array of shop items currently rendered in the table. */
  userList: userItemData[];

  /** The React state setter for the `shopList` array. */
  setUserList: Dispatch<SetStateAction<userItemData[]>>;

  /** Memoized array of shop IDs for dnd-kit's `SortableContext`. */
  dataIds: UniqueIdentifier[];

  /** The component to be used for rendering each draggable row. */
  DraggableRow: React.ComponentType<{ row: Row<userItemData> }>;

  /** Callback function to handle the `onDragEnd` event from dnd-kit. */
  handleDragEnd: (event: DragEndEvent) => void;
}

/**
 * Renders a tab panel content, displaying a sortable and paginated table
 * of shops based on the provided `statusFilter`.
 *
 * @param {tabShopProps} props The destructured props for the component.
 * @returns {React.ReactElement} The rendered tab panel.
 */
const TabUser = ({
  statusFilter,
  isReset,
  sensors,
  sortableId,
  table,
  columns,
  data,
  setData,
  userList,
  setUserList,
  dataIds,
  DraggableRow,
  handleDragEnd,
}: tabShopProps) => {
  const [rows, setRows] = React.useState<number>(10);
  const t = useTranslations('admin_user_page.user_tab');
  useEffect(() => {
    fetchData(
      '/api/manager/user',
      { page: 1, limit: rows, lock: statusFilter },
      setData
    );
  }, [statusFilter, isReset]);

  useEffect(() => {
    //console.log('category data changed:', data);
    if (data) {
      setUserList(data.data);
    }
  }, [data]);

  if (!data || !userList) return <Loading />;

  return (
    <>
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
              {userList.length !== 0 ? (
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
                    {t('t_no_shop_found')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} {t('t_of')}{' '}
          {table.getFilteredRowModel().rows.length} {t('t_rows_selected')}
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              {t('t_rows_per_page')}
            </Label>
            <Select
              value={rows.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
                setRows(Number(value));
                fetchData(
                  '/api/manager/user',
                  { page: 1, limit: Number(value), isActive: statusFilter },
                  setData
                );
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
                fetchData(
                  '/api/manager/user',
                  { page: 1, limit: rows, isActive: statusFilter },
                  setData
                );
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
                fetchData(
                  '/api/manager/user',
                  {
                    page: data.pagination.page - 1,
                    limit: rows,
                    isActive: statusFilter,
                  },
                  setData
                );
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
                fetchData(
                  '/api/manager/user',
                  {
                    page: data.pagination.page + 1,
                    limit: rows,
                    isActive: statusFilter,
                  },
                  setData
                );
              }}
              disabled={data.pagination.page + 1 > data.pagination.totalPages}
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
                fetchData(
                  '/api/manager/shop',
                  {
                    page: data.pagination.totalPages,
                    limit: rows,
                    isActive: statusFilter,
                  },
                  setData
                );
              }}
              disabled={data.pagination.page + 1 > data.pagination.totalPages}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
export default TabUser;
