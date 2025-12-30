
import React, { useState } from 'react';
import { X, Minus, Plus, Star, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const QuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart } = useStore();
  const [quantity, setQuantity] = useState(1);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 5;

  const handleClose = () => {
    setQuickViewProduct(null);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-scale-in">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white text-gray-500 hover:text-gray-900 rounded-full transition-colors shadow-sm"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Image Side */}
        <div className="w-full md:w-1/2 bg-gray-100 relative h-64 md:h-auto">
          <img 
            src={product.image} 
            alt={product.name} 
            className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
          />
          {product.isSeasonal && (
            <span className="absolute top-4 left-4 bg-[#f49f17] text-white text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-md shadow-sm">
                Seasonal
            </span>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <span className="bg-red-600 text-white font-bold px-6 py-2 text-lg uppercase tracking-widest rounded-lg shadow-lg">
                    Out of Stock
                </span>
            </div>
          )}
        </div>

        {/* Details Side */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
          <div className="mb-2 flex items-center justify-between">
              <span className="text-[#143f17] font-bold uppercase tracking-wide text-xs">{product.category}</span>
              <div className="flex items-center text-yellow-500 text-xs font-bold">
                  <Star className="h-3 w-3 fill-current mr-1" />
                  {product.rating.toFixed(1)} ({product.reviews})
              </div>
          </div>
          
          <Link to={`/product/${product.id}`} onClick={handleClose} className="group">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2 group-hover:text-[#143f17] transition-colors">
                {product.name}
            </h2>
          </Link>
          
          <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-bold text-gray-900">₦{product.price.toLocaleString()}</span>
              <span className="text-sm text-gray-500">/ {product.unit}</span>
          </div>

          <p className="text-gray-600 mb-6 text-sm leading-relaxed line-clamp-3">
             {product.description}
          </p>

          {isLowStock && (
              <div className="mb-4 flex items-center gap-2 text-orange-600 text-xs font-bold bg-orange-50 px-3 py-2 rounded-lg">
                  <AlertTriangle className="h-4 w-4" /> Only {product.stock} left in stock!
              </div>
          )}

          <div className="mt-auto">
             <div className="flex gap-4 mb-4">
                <div className={`flex items-center border border-gray-200 rounded-lg ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                    <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 hover:bg-gray-50 text-gray-600"
                        disabled={isOutOfStock}
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-gray-900">{quantity}</span>
                    <button 
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="p-3 hover:bg-gray-50 text-gray-600"
                        disabled={isOutOfStock || quantity >= product.stock}
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
                <button 
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 font-bold py-3 rounded-lg transition-colors shadow-lg ${
                        isOutOfStock 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                        : 'bg-[#143f17] hover:bg-[#0d2610] text-white'
                    }`}
                >
                    {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                </button>
             </div>
             
             <Link 
                to={`/product/${product.id}`} 
                onClick={handleClose}
                className="flex items-center justify-center gap-1 text-sm font-bold text-gray-500 hover:text-[#143f17] transition-colors"
             >
                View Full Details <ArrowRight className="h-4 w-4" />
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
