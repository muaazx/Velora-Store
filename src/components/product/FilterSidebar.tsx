import React from 'react';
import { Filter, RotateCcw, Star, Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface FilterSidebarProps {
  allBrands: string[];
  onCloseMobile?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ allBrands, onCloseMobile }) => {
  const { categories, filterParams, setFilterParams, resetFilters } = useStore();

  const handlePriceChange = (min: number, max: number) => {
    setFilterParams(prev => ({ ...prev, minPrice: min, maxPrice: max }));
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-4 space-y-6 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white text-sm">
          <Filter className="w-4 h-4 text-orange-500" />
          <span>Filters</span>
        </div>
        <button
          onClick={resetFilters}
          className="text-zinc-500 hover:text-orange-600 dark:hover:text-orange-400 font-medium flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset All
        </button>
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-bold text-zinc-900 dark:text-white mb-2.5 uppercase tracking-wider text-[11px]">
          Department
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => setFilterParams(prev => ({ ...prev, category: 'all' }))}
            className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
              filterParams.category === 'all'
                ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <span>All Departments</span>
            {filterParams.category === 'all' && <Check className="w-3.5 h-3.5" />}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterParams(prev => ({ ...prev, category: cat.slug }))}
              className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                filterParams.category === cat.slug
                  ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              <span className="truncate">{cat.name}</span>
              <span className="text-[10px] text-zinc-400 shrink-0">({cat.productCount || 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[11px]">
            Price Range ($)
          </h4>
          <span className="font-semibold text-orange-600 dark:text-orange-400">
            ${filterParams.minPrice || 0} - ${filterParams.maxPrice || 2500}
          </span>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="2500"
            step="50"
            value={filterParams.maxPrice || 2500}
            onChange={e => handlePriceChange(filterParams.minPrice || 0, Number(e.target.value))}
            className="w-full accent-orange-500 cursor-pointer"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filterParams.minPrice || ''}
              onChange={e => handlePriceChange(Number(e.target.value) || 0, filterParams.maxPrice || 2500)}
              className="w-full px-2 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-center text-xs dark:text-white"
            />
            <span className="text-zinc-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filterParams.maxPrice || ''}
              onChange={e => handlePriceChange(filterParams.minPrice || 0, Number(e.target.value) || 2500)}
              className="w-full px-2 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-center text-xs dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Brands */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <h4 className="font-bold text-zinc-900 dark:text-white mb-2.5 uppercase tracking-wider text-[11px]">
          Brand
        </h4>
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          <button
            onClick={() => setFilterParams(prev => ({ ...prev, brand: 'all' }))}
            className={`w-full text-left px-2 py-1 rounded-md transition-colors ${
              !filterParams.brand || filterParams.brand === 'all'
                ? 'text-orange-600 font-bold bg-orange-50 dark:bg-orange-950/40'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            All Brands
          </button>
          {allBrands.map(brand => (
            <button
              key={brand}
              onClick={() => setFilterParams(prev => ({ ...prev, brand }))}
              className={`w-full text-left px-2 py-1 rounded-md transition-colors ${
                filterParams.brand?.toLowerCase() === brand.toLowerCase()
                  ? 'text-orange-600 font-bold bg-orange-50 dark:bg-orange-950/40'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <h4 className="font-bold text-zinc-900 dark:text-white mb-2.5 uppercase tracking-wider text-[11px]">
          Customer Rating
        </h4>
        <div className="space-y-1.5">
          {[4, 3, 2].map(stars => (
            <button
              key={stars}
              onClick={() => setFilterParams(prev => ({ ...prev, minRating: prev.minRating === stars ? 0 : stars }))}
              className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
                filterParams.minRating === stars
                  ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-[11px]">& Up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Availability & Deals checkboxes */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
        <label className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={Boolean(filterParams.inStockOnly)}
            onChange={e => setFilterParams(prev => ({ ...prev, inStockOnly: e.target.checked }))}
            className="rounded text-orange-500 focus:ring-orange-400"
          />
          <span>In Stock Only</span>
        </label>

        <label className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={Boolean(filterParams.onSaleOnly)}
            onChange={e => setFilterParams(prev => ({ ...prev, onSaleOnly: e.target.checked }))}
            className="rounded text-orange-500 focus:ring-orange-400"
          />
          <span>On Discount / Sale</span>
        </label>

        <label className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium cursor-pointer select-none">
          <input
            type="checkbox"
            checked={Boolean(filterParams.flashSaleOnly)}
            onChange={e => setFilterParams(prev => ({ ...prev, flashSaleOnly: e.target.checked }))}
            className="rounded text-red-600 focus:ring-red-400"
          />
          <span>Flash Deals Only</span>
        </label>
      </div>

      {onCloseMobile && (
        <button
          onClick={onCloseMobile}
          className="w-full py-2.5 bg-orange-500 text-white font-bold rounded-lg mt-4"
        >
          Apply Filters
        </button>
      )}
    </div>
  );
};
