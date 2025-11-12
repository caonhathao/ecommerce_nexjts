'use client';

import * as React from 'react';
import { ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { CategoryNode } from '@/hooks/use-categories';

type CategoryCascaderProps = {
  categories: CategoryNode[];
  value?: string | null;
  onChange: (id: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

export function CategoryCascader({
  categories,
  value,
  onChange,
  disabled,
  placeholder = 'Chọn Danh mục',
  className,
}: CategoryCascaderProps) {
  const [open, setOpen] = React.useState(false);
  const [path, setPath] = React.useState<CategoryNode[]>([]);

  const findPathById = React.useCallback(
    (nodes: CategoryNode[], id: string): CategoryNode[] | null => {
      for (const n of nodes) {
        if (n.id === id) return [n];
        if (n.children?.length) {
          const sub = findPathById(n.children, id);
          if (sub) return [n, ...sub];
        }
      }
      return null;
    },
    []
  );

  // hydrate path when external value changes
  React.useEffect(() => {
    if (value && categories.length) {
      const p = findPathById(categories, value);
      setPath(p ?? []);
    } else if (!value) {
      setPath([]);
    }
  }, [value, categories, findPathById]);

  // Build columns: first is roots, then each selected node's children
  const columns: CategoryNode[][] = React.useMemo(() => {
    const cols: CategoryNode[][] = [];
    cols.push(categories);
    path.forEach((node) => cols.push(node.children ?? []));
    return cols;
  }, [categories, path]);

  const displayText = path.length ? path.map((n) => n.name).join(' > ') : '';

  const handleClickItem = (colIndex: number, node: CategoryNode) => {
    // If clicked on a previous column, truncate path first
    const newPath = path.slice(0, colIndex);
    if (node.children?.length) {
      setPath([...newPath, node]);
    } else {
      setPath([...newPath, node]);
      onChange(node.id);
      setOpen(false);
    }
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPath([]);
    onChange(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
        >
          <span className={cn(!displayText && 'text-muted-foreground')}>
            {displayText || placeholder}
          </span>
          {displayText ? (
            <X
              className="ml-2 size-4 opacity-70 hover:opacity-100"
              onClick={clearSelection}
            />
          ) : (
            <ChevronRight className="ml-2 size-4 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[720px] p-0" align="start">
        {/* Breadcrumb */}
        <div className="px-3 py-2 text-sm">
          <span className="text-muted-foreground">Đang chọn: </span>
          <span className="font-medium">{displayText || '—'}</span>
        </div>
        <Separator />
        {/* Columns */}
        <div className="flex max-h-[340px] gap-0.5 p-2">
          {columns.map((items, colIdx) => (
            <React.Fragment key={colIdx}>
              {colIdx > 0 && (
                <Separator orientation="vertical" className="mx-1" />
              )}
              <ScrollArea className="h-[300px] w-[220px]">
                <ul className="pr-1">
                  {items.map((item) => {
                    const isInPath = path[colIdx]?.id === item.id;
                    const isSelectedLeaf =
                      value === item.id &&
                      (!item.children || item.children.length === 0);
                    const hasChildren = !!item.children?.length;

                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          className={cn(
                            'w-full flex items-center justify-between text-left px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground',
                            isInPath && 'bg-accent text-accent-foreground',
                            isSelectedLeaf && 'ring-1 ring-primary/50'
                          )}
                          onClick={() => handleClickItem(colIdx, item)}
                        >
                          <span className="truncate">{item.name}</span>
                          {hasChildren && (
                            <ChevronRight className="size-4 opacity-60" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            </React.Fragment>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
