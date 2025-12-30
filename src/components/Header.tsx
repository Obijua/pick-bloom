
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, Search, User as UserIcon, X, Leaf, ChevronRight, LayoutDashboard, Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import AuthModal from './AuthModal';
import { CATEGORIES } from '../../src/constants';
import { Product } from '../types';

const Header: React.FC = () => {
  const { cart, setIsCartOpen, user, logout, setIsAuthModalOpen, wishlist, products } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const isAdmin = user?.role === 'admin';

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu/search/suggestions when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowMobileSearch(false);
    setShowSuggestions(false);
    setSearchQuery('');
  }, [location]);

  // Handle Search Input & Suggestions
  useEffect(() => {
      if (searchQuery.trim().length > 1) {
          const matched = products.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
          ).slice(0, 5); // Limit to 5 suggestions
          setSuggestions(matched);
          setShowSuggestions(true);
      } else {
          setSuggestions([]);
          setShowSuggestions(false);
      }
  }, [searchQuery, products]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setShowMobileSearch(false);
      setShowSuggestions(false);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/shop?category=${encodeURIComponent(categoryName)}`);
    setIsMobileMenuOpen(false);
  };

  // Hard reload to refresh app state
  const handleLogoClick = (e: React.MouseEvent) => {
      e.preventDefault();
      window.location.href = '/';
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            {/* Logo - Refreshes App */}
            <a 
                href="/" 
                onClick={handleLogoClick}
                className="flex items-center gap-2 group shrink-0 cursor-pointer"
            >
              <div className="bg-primary-50 p-2 rounded-full group-hover:bg-primary-100 transition-colors">
                <Leaf className="h-6 w-6 text-primary-600" />
              </div>
              <span className="text-xl font-bold font-serif text-[#143f17] hidden sm:block">
                Pick <span className="bg-">Bloom</span>
              </span>
              <span className="text-xl font-bold font-serif text-gray-900 sm:hidden">
                FM
              </span>
            </a>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-auto relative" ref={searchRef}>
                <form onSubmit={handleSearch} className="w-full relative">
                    <input
                        type="text"
                        placeholder="Search for fresh products..."
                        className="w-full pl-11 pr-4 py-2 bg-white border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all text-sm placeholder-gray-400 shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => { if(searchQuery.length > 1) setShowSuggestions(true); }}
                    />
                    <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </form>
                
                {/* Search Suggestions Dropdown */}
                {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up">
                        {suggestions.length > 0 ? (
                            <ul>
                                {suggestions.map(product => (
                                    <li key={product.id}>
                                        <Link 
                                            to={`/product/${product.id}`}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                                            onClick={() => setShowSuggestions(false)}
                                        >
                                            <img src={product.image} alt="" className="w-10 h-10 rounded object-cover" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{product.name}</p>
                                                <p className="text-xs text-primary-600 font-medium">₦{product.price.toLocaleString()}</p>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                                <li className="bg-gray-50 p-2 text-center">
                                    <button 
                                        onClick={(e) => handleSearch(e)}
                                        className="text-xs font-bold text-primary-600 hover:underline"
                                    >
                                        View all results for "{searchQuery}"
                                    </button>
                                </li>
                            </ul>
                        ) : (
                            <div className="p-4 text-center text-sm text-gray-500">
                                No products found.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* Mobile Search Toggle */}
              <button 
                className="md:hidden p-2 text-gray-600 hover:text-primary-600 rounded-full transition-colors"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
              >
                <Search className="h-6 w-6" />
              </button>
              
              {/* Wishlist - Visible on desktop */}
              {!isAdmin && (
                  <Link 
                    to="/wishlist" 
                    className="hidden sm:flex p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-full transition-all relative"
                    title="Wishlist"
                  >
                    <Heart className="h-6 w-6" />
                    {wishlist.length > 0 && (
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border border-white"></span>
                    )}
                  </Link>
              )}

              {user ? (
                <div className="hidden sm:flex items-center gap-3">
                    {isAdmin && (
                        <Link to="/admin" className="text-sm font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                            <LayoutDashboard className="h-4 w-4" /> Dashboard
                        </Link>
                    )}
                    <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary-600">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                        <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover"/>
                    </div>
                    <span className="max-w-25 truncate">Hi, {user?.name?.split(' ')[0] || 'User'}</span>
                    </Link>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-primary-600 font-medium px-2 py-1 cursor-pointer"
                >
                  <UserIcon className="h-5 w-5" />
                  <span className="text-sm">Login</span>
                </button>
              )}
              
              {!isAdmin && (
                <button 
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all cursor-pointer"
                >
                    <ShoppingCart className="h-6 w-6" />
                    {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-[#f49f17] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                        {cartItemCount}
                    </span>
                    )}
                </button>
              )}

              {/* Mobile Menu Button */}
              <button 
                className="md:hidden p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-full"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar Dropdown */}
        {showMobileSearch && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-100 p-4 animate-slide-in-down z-30 shadow-md">
            <form onSubmit={handleSearch} className="relative mb-2">
              <input
                type="text"
                placeholder="Search products..."
                autoFocus
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            </form>
            {suggestions.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm max-h-60 overflow-y-auto">
                    {suggestions.map(product => (
                         <Link 
                            key={product.id}
                            to={`/product/${product.id}`}
                            className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0"
                            onClick={() => setShowMobileSearch(false)}
                        >
                            <img src={product.image} alt="" className="w-8 h-8 rounded object-cover" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900">{product.name}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                        </Link>
                    ))}
                </div>
            )}
          </div>
        )}

        {/* Mobile Menu Sidebar - Half width */}
        <div 
            className={`fixed inset-0 z-50 transition-opacity duration-300 md:hidden ${
                isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
        >
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Sidebar Drawer - Changed width to w-1/2 (50%) */}
            <div 
                className={`absolute inset-y-0 right-0 w-1/2 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
                    isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <span className="font-serif font-bold text-lg text-gray-900">Menu</span>
                    <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {/* User Section Mobile */}
                    <div className="p-4 border-b border-gray-100">
                        {user ? (
                             <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                                        <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover"/>
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-gray-900 truncate text-sm">{user?.name}</p>
                                        <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-primary-600 font-medium hover:underline">Profile</Link>
                                    </div>
                                </div>
                                {isAdmin && (
                                     <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="bg-primary-600 text-white text-center py-2 rounded-lg font-bold text-xs">
                                        Admin
                                     </Link>
                                )}
                             </div>
                        ) : (
                            <button 
                                onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}
                                className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2 rounded-lg font-bold shadow-sm active:scale-95 transition-transform text-sm"
                            >
                                <UserIcon className="h-4 w-4" />
                                Sign In
                            </button>
                        )}
                    </div>

                    <div className="py-2">
                        <Link 
                            to="/wishlist" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-sm"
                        >
                            <Heart className="h-4 w-4" />
                            <span className="font-medium">Wishlist</span>
                            <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">{wishlist.length}</span>
                        </Link>
                        
                        <div className="px-4 py-2 mt-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Categories
                        </div>
                        <ul className="space-y-0.5">
                            {CATEGORIES.map((cat, idx) => (
                                <li key={idx}>
                                    <button 
                                        onClick={() => handleCategoryClick(cat.name)}
                                        className="w-full flex items-center justify-between px-4 py-2 text-left text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors border-l-4 border-transparent hover:border-primary-600 text-sm"
                                    >
                                        <span className="font-medium truncate">{cat.name}</span>
                                        <ChevronRight className="h-3 w-3 text-gray-400" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <div className="grid grid-cols-1 gap-2">
                         <a 
                            href="/"
                            onClick={(e) => {
                                handleLogoClick(e);
                                setIsMobileMenuOpen(false);
                            }}
                            className="text-center py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-primary-600 hover:text-primary-600 transition-colors cursor-pointer"
                        >
                            Home
                         </a>
                         <Link 
                            to="/about" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-center py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-primary-600 hover:text-primary-600 transition-colors"
                        >
                            About
                         </Link>
                    </div>
                    {user && (
                        <button 
                            onClick={() => { logout(); setIsMobileMenuOpen(false); }} 
                            className="w-full mt-3 text-red-500 font-medium text-sm py-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            Sign Out
                        </button>
                    )}
                </div>
            </div>
        </div>
      </header>
      <AuthModal />
    </>
  );
};

export default Header;