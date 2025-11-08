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
import { productData, productItemData } from '@/types/manager.data-types';
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
import { Dispatch, SetStateAction, useEffect } from 'react';

/**
 * @interface tabProductProps
 * Defines the complete set of props required by the TabProduct component.
 */
interface tabProductProps {
  /** The current visibility filter string (e.g., "PUBLIC", "PRIVATE"). */
  visibilityFilter: string;

  /** Check the reset state: If reset data is called, change reset state */
  isReset: boolean;

  /** Array of sensor descriptors from dnd-kit for enabling drag-and-drop. */
  sensors: SensorDescriptor<any>[];

  /** A unique string ID passed to the SortableContext. */
  sortableId: string;

  /** The table instance object returned from `useReactTable`. */
  table: TanstackTable<productItemData>;

  /** The column definitions used to build the table. */
  columns: ColumnDef<productItemData>[];

  /** The complete data object from the API, including pagination. */
  data: productData | null;

  /** The React state setter for the `data` object. */
  setData: Dispatch<SetStateAction<productData | null>>;

  /** The array of product items currently rendered in the table. */
  productList: productItemData[];

  /** The React state setter for the `productList` array. */
  setProductList: Dispatch<SetStateAction<productItemData[]>>;

  /** Memoized array of product IDs for dnd-kit's `SortableContext`. */
  dataIds: UniqueIdentifier[];

  /** The component to be used for rendering each draggable row. */
  DraggableRow: React.ComponentType<{ row: Row<productItemData> }>;

  /** Callback function to handle the `onDragEnd` event from dnd-kit. */
  handleDragEnd: (event: DragEndEvent) => void;
}

/**
 * Renders a tab panel content, displaying a sortable and paginated table
 * of products based on the provided `visibilityFilter`.
 *
 * @param {tabProductProps} props The destructured props for the component.
 * @returns {React.ReactElement} The rendered tab panel.
 */
const TabProduct = ({
  visibilityFilter,
  isReset,
  sensors,
  sortableId,
  table,
  columns,
  data,
  setData,
  productList,
  setProductList,
  dataIds,
  DraggableRow,
  handleDragEnd,
}: tabProductProps) => {
  const fetchData = async (
    page: number,
    limit: number,
    visibility: string = ''
  ) => {
    try {
      const response = await fetch(
        `/api/product/manage?page=${page}&&limit=${limit}&&status=${visibility}`
      );
      const data = await response.json();

      //console.log(data);
      setData(data);
      setProductList(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData(1, 10, visibilityFilter);
  }, [visibilityFilter, isReset]);

  // useEffect(() => {
  //   console.log(productList);
  // }, [productList]);

  if (!data || !productList) return <Loading />;

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
                fetchData(1, Number(value), visibilityFilter);
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
                fetchData(1, 10, visibilityFilter);
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
                fetchData(data.pagination.page - 1, 10, visibilityFilter);
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
                fetchData(data.pagination.page + 1, 10, visibilityFilter);
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
                fetchData(data.pagination.totalPages, 10, visibilityFilter);
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
export default TabProduct;
