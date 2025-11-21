import { SearchFilters } from '@/types/product.data-types';
import { cn } from '@/lib/utils';

interface SearchSortBarProps {
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
}

export function SearchSortBar({ filters, onFilterChange }: SearchSortBarProps) {
  const isSortActive = (key: string, order: string = 'desc') => {
    return filters.sortBy === key && filters.sortOrder === order;
  };

  const handleSort = (
    key: 'createdAt' | 'price' | 'rating',
    order: 'asc' | 'desc'
  ) => {
    onFilterChange({ sortBy: key, sortOrder: order });
  };

  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-gray-200 bg-white p-4 mb-4 rounded-lg">
      <span className="text-sm text-gray-500 mr-2">Sort by:</span>

      {/* Popular / Newest Tabs */}
      <button
        onClick={() => handleSort('createdAt', 'desc')}
        className={cn(
          'px-4 py-2 text-sm rounded-full transition-colors',
          isSortActive('createdAt', 'desc')
            ? 'bg-blue-50 text-blue-600 font-medium border border-blue-200'
            : 'text-gray-600 hover:bg-gray-100'
        )}
      >
        Newest
      </button>

      <button
        onClick={() => handleSort('rating', 'desc')}
        className={cn(
          'px-4 py-2 text-sm rounded-full transition-colors',
          isSortActive('rating', 'desc')
            ? 'bg-blue-50 text-blue-600 font-medium border border-blue-200'
            : 'text-gray-600 hover:bg-gray-100'
        )}
      >
        Top Rated
      </button>

      <button
        onClick={() => handleSort('price', 'asc')}
        className={cn(
          'px-4 py-2 text-sm rounded-full transition-colors',
          isSortActive('price', 'asc')
            ? 'bg-blue-50 text-blue-600 font-medium border border-blue-200'
            : 'text-gray-600 hover:bg-gray-100'
        )}
      >
        Price: Low to High
      </button>

      <button
        onClick={() => handleSort('price', 'desc')}
        className={cn(
          'px-4 py-2 text-sm rounded-full transition-colors',
          isSortActive('price', 'desc')
            ? 'bg-blue-50 text-blue-600 font-medium border border-blue-200'
            : 'text-gray-600 hover:bg-gray-100'
        )}
      >
        Price: High to Low
      </button>
    </div>
  );
}
