import { SearchFilters } from '@/types/product.data-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

interface SearchFiltersProps {
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  categories?: Array<{ id: string; name: string }>;
}

export function SearchFiltersPanel({
  filters,
  onFilterChange,
  categories = [],
}: SearchFiltersProps) {
  // Local state for price inputs to avoid triggering fetch on every keystroke
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || '',
    max: filters.maxPrice || '',
  });

  const handlePriceApply = () => {
    onFilterChange({
      minPrice: priceRange.min || undefined,
      maxPrice: priceRange.max || undefined,
    });
  };

  const handleClearFilters = () => {
    setPriceRange({ min: '', max: '' });
    onFilterChange({
      categoryId: undefined,
      shopId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    });
  };

  return (
    <div className="space-y-6 bg-white p-4 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm uppercase text-gray-800">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="h-8 text-xs text-blue-500 hover:text-blue-700 hover:bg-blue-50"
        >
          Reset
        </Button>
      </div>

      <Separator />

      {/* Category List Style (Like Tiki Sidebar) */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Category</h4>
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => onFilterChange({ categoryId: undefined })}
            className={`text-sm text-left px-2 py-1.5 rounded-md transition-colors ${
              !filters.categoryId
                ? 'bg-gray-100 font-medium text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onFilterChange({ categoryId: cat.id })}
              className={`text-sm text-left px-2 py-1.5 rounded-md transition-colors ${
                filters.categoryId === cat.id
                  ? 'bg-gray-100 font-medium text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Price</h4>
        <div className="text-xs text-gray-500 mb-2">Enter price range</div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="0"
            value={priceRange.min}
            onChange={(e) =>
              setPriceRange((prev) => ({ ...prev, min: e.target.value }))
            }
            className="h-8 text-sm bg-gray-50"
          />
          <span className="text-gray-400">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) =>
              setPriceRange((prev) => ({ ...prev, max: e.target.value }))
            }
            className="h-8 text-sm bg-gray-50"
          />
        </div>
        <Button
          variant="outline"
          className="w-full mt-2 h-8 text-xs border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
          onClick={handlePriceApply}
        >
          Apply
        </Button>
      </div>

      <Separator />

      {/* Service / Supplier (Mockup for visual completeness) */}
      <div className="space-y-3 opacity-60 pointer-events-none">
        <h4 className="text-sm font-semibold text-gray-900">Supplier</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 border rounded bg-gray-50"></div> Tiki
            Trading
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 border rounded bg-gray-50"></div> Global
            Store
          </div>
        </div>
      </div>
    </div>
  );
}
