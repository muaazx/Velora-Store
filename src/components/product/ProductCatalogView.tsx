import React, { useState, useMemo } from 'react';
import {
  Grid,
  List,
  SlidersHorizontal,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  PackageSearch
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { FilterSidebar } from './FilterSidebar';

export const ProductCatalogView: React.FC = () => {
  const { products, categories, filterParams, setFilterParams, resetFilters } = useStore();
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Extract all unique brands
  const allBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach(p => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  }, [products]);

  // Client-side filtration and sorting
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (filterParams.category && filterParams.category !== 'all') {
      list = list.filter(p => p.category?.slug === filterParams.category);
    }

    if (filterParams.brand && filterParams.brand !== 'all') {
      list = list.filter(p => p.brand.toLowerCase() === filterParams.brand?.toLowerCase());
    }

    if (filterParams.search && filterParams.search.trim()) {
      const q = filterParams.search.toLowerCase();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }

    if (filterParams.minPrice) {
      list = list.filter(p => {
        const effPrice = p.isFlashSale && p.flashSalePrice ? p.flashSalePrice : p.price * (1 - p.discount / 100);
        return effPrice >= (filterParams.minPrice || 0);
      });
    }

    if (filterParams.maxPrice) {
      list = list.filter(p => {
        const effPrice = p.isFlashSale && p.flashSalePrice ? p.flashSalePrice : p.price * (1 - p.discount / 100);
        return effPrice <= (filterParams.maxPrice || 2500);
      });
    }

    if (filterParams.minRating && filterParams.minRating > 0) {
      list = list.filter(p => p.rating >= (filterParams.minRating || 0));
    }

    if (filterParams.inStockOnly) {
      list = list.filter(p => p.quantity > 0);
    }

    if (filterParams.onSaleOnly) {
      list = list.filter(p => p.discount > 0 || p.isFlashSale);
    }

    if (filterParams.flashSaleOnly) {
      list = list.filter(p => p.isFlashSale);
    }

    // Sort
    switch (filterParams.sortBy) {
      case 'price_asc':
        list.sort((a, b) => {
          const pA = a.isFlashSale && a.flashSalePrice ? a.flashSalePrice : a.price * (1 - a.discount / 100);
          const pB = b.isFlashSale && b.flashSalePrice ? b.flashSalePrice : b.price * (1 - b.discount / 100);
          return pA - pB;
        });
        break;
      case 'price_desc':
        list.sort((a, b) => {
          const pA = a.isFlashSale && a.flashSalePrice ? a.flashSalePrice : a.price * (1 - a.discount / 100);
          const pB = b.isFlashSale && b.flashSalePrice ? b.flashSalePrice : b.price * (1 - b.discount / 100);
          return pB - pA;
        });
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
      default:
        list.sort((a, b) => b.soldCount - a.soldCount);
        break;
    }

    return list;
  }, [products, filterParams]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeCategoryName = categories.find(c => c.slug === filterParams.category)?.name || 'All Departments';

  const hasActiveFilters = Boolean(
    (filterParams.category && filterParams.category !== 'all') ||
    (filterParams.brand && filterParams.brand !== 'all') ||
    filterParams.search ||
    filterParams.minPrice ||
    (filterParams.maxPrice && filterParams.maxPrice < 2500) ||
    filterParams.minRating ||
    filterParams.inStockOnly ||
    filterParams.onSaleOnly ||
    filterParams.flashSaleOnly
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb & Title */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
          <span>Home</span>
          <span>/</span>
          <span>Catalog</span>
          {filterParams.category && filterParams.category !== 'all' && (
            <>
              <span>/</span>
              <span className="text-orange-600 font-medium">{activeCategoryName}</span>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              {filterParams.search ? `Search results for "${filterParams.search}"` : activeCategoryName}
              {filterParams.flashSaleOnly && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-600 text-white font-bold">
                  Flash Sale
                </span>
              )}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Showing {filteredProducts.length} verified products ready to ship
            </p>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-semibold text-zinc-800 dark:text-zinc-200"
          >
            <SlidersHorizontal className="w-4 h-4 text-orange-500" />
            <span>Filters ({hasActiveFilters ? 'Active' : 'All'})</span>
          </button>
        </div>
      </div>

      {/* Main Catalog Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1 space-y-4">
          <FilterSidebar allBrands={allBrands} />
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Top Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 text-xs">
            {/* Active Filters tags */}
            <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-[200px]">
              {hasActiveFilters ? (
                <>
                  <span className="text-zinc-400 font-semibold text-[11px] mr-1">Active:</span>
                  {filterParams.category && filterParams.category !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-medium">
                      {activeCategoryName}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setFilterParams(prev => ({ ...prev, category: 'all' }))}
                      />
                    </span>
                  )}
                  {filterParams.brand && filterParams.brand !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-medium">
                      Brand: {filterParams.brand}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setFilterParams(prev => ({ ...prev, brand: 'all' }))}
                      />
                    </span>
                  )}
                  {filterParams.flashSaleOnly && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-medium">
                      Flash Deal
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setFilterParams(prev => ({ ...prev, flashSaleOnly: false }))}
                      />
                    </span>
                  )}
                  <button
                    onClick={resetFilters}
                    className="text-xs text-zinc-400 hover:text-orange-600 underline ml-1"
                  >
                    Clear
                  </button>
                </>
              ) : (
                <span className="text-zinc-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  All active catalog items
                </span>
              )}
            </div>

            {/* Right side: Sort and Layout View Switcher */}
            <div className="flex items-center gap-3">
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-400">Sort By:</span>
                <select
                  value={filterParams.sortBy || 'popular'}
                  onChange={e => setFilterParams(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
                >
                  <option value="popular">Popularity & Sales</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Customer Rating</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>

              {/* Grid / List toggle */}
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
                <button
                  onClick={() => setLayout('grid')}
                  className={`p-1.5 rounded-md transition-colors ${
                    layout === 'grid'
                      ? 'bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-400 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                  aria-label="Grid layout"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setLayout('list')}
                  className={`p-1.5 rounded-md transition-colors ${
                    layout === 'list'
                      ? 'bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-400 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                  aria-label="List layout"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Items List */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center space-y-3">
              <PackageSearch className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
              <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">
                No matching products found
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Try adjusting your price range, searching with a broader keyword, or resetting active filters.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : layout === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {paginatedProducts.map(product => (
                <ProductCard key={product.id} product={product} layout="grid" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedProducts.map(product => (
                <ProductCard key={product.id} product={product} layout="list" />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs">
              <span className="text-zinc-500">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage(prev => Math.max(1, prev - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentPage(i + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-8 h-8 rounded-lg font-bold transition-colors ${
                      currentPage === i + 1
                        ? 'bg-orange-500 text-white'
                        : 'border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage(prev => Math.min(totalPages, prev + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />
          <div className="relative w-80 max-w-[85%] bg-white dark:bg-zinc-900 h-full p-4 overflow-y-auto z-10">
            <FilterSidebar
              allBrands={allBrands}
              onCloseMobile={() => setIsMobileFilterOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
