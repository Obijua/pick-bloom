
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Heart, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, wishlist, toggleWishlist, setQuickViewProduct } = useStore();
  
  const isWishlisted = wishlist.includes(product.id);
  const isOutOfStock = product.stock === 0;

  return (
    <div className="group bg-white h-full flex flex-col relative">
      <div className="relative aspect-4/5 overflow-hidden bg-gray-100">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
            <img 
            src={product.image} 
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${isOutOfStock ? 'opacity-60 grayscale' : 'group-hover:scale-105'}`}
            />
            {product.isSeasonal && !isOutOfStock && (
            <span className="absolute top-0 left-0 bg-[#f49f17] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                Seasonal
            </span>
            )}
            {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-full shadow-sm">
                    Out of Stock
                </span>
            </div>
            )}
        </Link>

        {/* Quick View Button - Appears on hover */}
        <button
            onClick={(e) => {
                e.preventDefault();
                setQuickViewProduct(product);
            }}
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 backdrop-blur-sm text-gray-800 hover:text-[#143f17] px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 z-20 whitespace-nowrap"
        >
            <Eye className="h-3 w-3" /> Quick View
        </button>
      </div>
      
      <button 
        onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
        }}
        className={`absolute top-2 right-2 p-2 rounded-full transition-colors z-10 shadow-sm ${
            isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white cursor-pointer'
        }`}
      >
        <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
      </button>

      <div className="pt-2 flex flex-col grow">
        <Link to={`/product/${product.id}`} className="block mb-1">
          <h3 className="text-sm font-medium text-gray-900 leading-tight line-clamp-2 hover:text-[#143f17] transition-colors min-h-[2.5em]">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto pt-1">
            <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-gray-900">₦{product.price.toLocaleString()}</span>
                {isOutOfStock ? (
                    <button 
                        disabled
                        className="bg-gray-100 text-gray-400 px-4 py-1.5 text-xs font-bold uppercase tracking-wide cursor-not-allowed flex items-center gap-1"
                    >
                        Sold Out
                    </button>
                ) : (
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            addToCart(product);
                        }}
                        className="bg-[#143f17] hover:bg-[#0d2610] text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer"
                    >
                        Add
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
