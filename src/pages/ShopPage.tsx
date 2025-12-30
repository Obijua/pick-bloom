
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, X, ChevronDown, ChevronLeft, ChevronRight, Search, RefreshCcw } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES } from '../../src/constants';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating';

const ITEMS_PER_PAGE = 40; 

const ShopPage: React.FC = () => {
  const { products, isLoading, refreshStore } = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const urlCategory = searchParams.get('category');
  const urlSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState(urlCategory || 'All');
  const [priceRange, setPriceRange] = useState<number>(50000);
  const [sortOption, setSortOption] = useState<SortOption>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    } else if (urlSearch) {
      setSelectedCategory('All');
    } else {
      setSelectedCategory('All');
    }
    setCurrentPage(1);
  }, [urlCategory, urlSearch]);

  const handleManualRefresh = async () => {
      setIsRefreshing(true);
      await refreshStore();
      setIsRefreshing(false);
  };

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      if (product.status === 'Draft') return false;
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesPrice = product.price <= priceRange;
      const matchesSearch = urlSearch ? product.name.toLowerCase().includes(urlSearch.toLowerCase()) : true;
      return matchesCategory && matchesPrice && matchesSearch;
    });

    switch (sortOption) {
      case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
      case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
      case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
      default: break;
    }
    return filtered;
  }, [selectedCategory, priceRange, urlSearch, sortOption, products]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-480 mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 flex items-center gap-2">
              {urlSearch ? `Results for "${urlSearch}"` : (selectedCategory === 'All' ? 'All Products' : selectedCategory)}
              {urlSearch && (
                  <button onClick={() => navigate('/shop')} className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-600 transition-colors">
                      <X className="h-5 w-5" />
                  </button>
              )}
            </h1>
            <p className="text-gray-500 mt-1">
                {isLoading ? 'Loading products...' : `Showing ${filteredProducts.length} results`}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
              className="lg:hidden flex items-center gap-2 bg-white px-4 py-2 border border-gray-200 shadow-sm text-sm font-medium hover:bg-gray-50"
              onClick={() => setIsMobileFilterOpen(true)}
            >
              <Filter className="h-4 w-4" /> Filters
            </button>
            
            <div className="relative group">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#143f17] focus:border-transparent text-sm font-medium shadow-sm"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0 space-y-8">
            <div className="bg-white p-6 border border-gray-200 sticky top-24">
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider">Categories</h3>
                <ul className="space-y-1">
                  <li>
                    <button 
                      onClick={() => navigate('/shop')}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${selectedCategory === 'All' ? 'bg-[#143f17] text-white font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      All Products
                    </button>
                  </li>
                  {CATEGORIES.map((cat, idx) => (
                    <li key={idx}>
                      <button 
                        onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.name)}`)}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer ${selectedCategory === cat.name ? 'bg-[#143f17] text-white font-medium' : 'text-gray-900 hover:bg-gray-100'}`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-4 flex justify-between uppercase text-xs tracking-wider">
                  <span>Max Price</span>
                  <span className="text-[#143f17]">₦{priceRange.toLocaleString()}</span>
                </h3>
                <input 
                  type="range" 
                  min="0" 
                  max="50000" 
                  step="500"
                  value={priceRange}
                  onChange={(e) => setPriceRange(parseInt(e.target.value))}
                  className="w-full h-1 bg-gray-200 appearance-none cursor-pointer accent-[#143f17]"
                />
              </div>
            </div>
          </aside>

          <div className="flex-1">
            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
                   {Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white p-16 text-center border border-gray-200">
                <Search className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
                <button onClick={handleManualRefresh} className="flex items-center gap-2 mx-auto bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
                  {paginatedProducts.map(product => <ProductCard key={product.id} product={product} />)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
