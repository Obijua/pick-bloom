
import React from 'react';
import { useStore } from '../context/StoreContext';
import { Heart, ShoppingBag } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

const WishlistPage: React.FC = () => {
  const { wishlist, products } = useStore();

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8 flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500 fill-current" /> My Wishlist
        </h1>

        {wishlistProducts.length > 0 ? (
             <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-x-3 gap-y-6">
                {wishlistProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
             </div>
        ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-red-300" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    Save items you love here so you can easily find them later.
                </p>
                <Link 
                    to="/shop" 
                    className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-700 transition-colors"
                >
                    <ShoppingBag className="h-5 w-5" /> Start Shopping
                </Link>
            </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
