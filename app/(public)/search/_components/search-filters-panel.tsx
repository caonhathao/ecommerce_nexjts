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
    <div className="space-y-6 bg-background-secondary p-4 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm uppercase text-text">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="h-8 text-xs text-primary/70 hover:text-primary hover:bg-primary/10"
        >
          Reset
        </Button>
      </div>

      <Separator />

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-text">Category</h4>
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => onFilterChange({ categoryId: undefined })}
            className={`text-sm text-left px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
              !filters.categoryId
                ? 'bg-secondary font-medium text-primary'
                : 'text-text hover:bg-secondary/50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onFilterChange({ categoryId: cat.id })}
              className={`text-sm text-left px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                filters.categoryId === cat.id
                  ? 'bg-secondary font-medium text-primary'
                  : 'text-text hover:bg-secondary/50'
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
        <h4 className="text-sm font-semibold text-text">Price</h4>
        <div className="text-xs text-text-secondary mb-2">
          Enter price range
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="0"
            value={priceRange.min}
            onChange={(e) =>
              setPriceRange((prev) => ({ ...prev, min: e.target.value }))
            }
            className="h-8 text-sm bg-primary/10 hover:bg-primary/30"
          />
          <span className="text-primary">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) =>
              setPriceRange((prev) => ({ ...prev, max: e.target.value }))
            }
            className="h-8 text-sm bg-primary/10 hover:bg-primary/30"
          />
        </div>
        <Button
          variant="outline"
          className="w-full mt-2 h-8 text-xs border-primary text-text/60 cursor-pointer hover:bg-secondary hover:text-primary"
          onClick={handlePriceApply}
        >
          Apply
        </Button>
      </div>

      <Separator />

      <div className="space-y-3 opacity-60 pointer-events-none">
        <h4 className="text-sm font-semibold text-text">Supplier</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <div className="w-4 h-4 border rounded bg-secondary/20"></div> Tiki
            Trading
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <div className="w-4 h-4 border rounded bg-secondary/20"></div>{' '}
            Global Store
          </div>
        </div>
      </div>
    </div>
  );
}
