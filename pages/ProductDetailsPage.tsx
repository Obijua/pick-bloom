import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Minus, Plus, Truck, ArrowLeft, ShieldCheck, MapPin, RefreshCw, Star, MessageSquare, AlertTriangle, ArrowRight } from 'lucide-react';
import { VENDORS } from '../constants';
import { useStore } from '../context/StoreContext';
import { Skeleton } from '../components/Skeleton';
import { Category } from '../types';
import ProductCard from '../components/ProductCard';

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart, isLoading, addProductReview, user, setIsAuthModalOpen } = useStore();
  const [quantity, setQuantity] = useState(1);
  
  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const product = products.find((p) => p.id === id);
  const isOutOfStock = product?.stock === 0;
  const isLowStock = product && product.stock > 0 && product.stock < 5;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        setIsAuthModalOpen(true);
        return;
    }
    if (product && comment.trim()) {
        setIsSubmittingReview(true);
        await addProductReview(product.id, {
            userName: user.name,
            rating,
            comment
        });
        setComment('');
        setRating(5);
        setIsSubmittingReview(false);
    }
  };

  // Show skeleton loading while data is fetching
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Skeleton className="h-4 w-32 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
                <div className="space-y-4">
                    <Skeleton className="aspect-square rounded-2xl w-full" />
                </div>
                <div>
                    <Skeleton className="h-4 w-24 mb-4" />
                    <Skeleton className="h-10 w-3/4 mb-6" />
                    <Skeleton className="h-8 w-40 mb-8" />
                    <div className="flex gap-4 mb-8">
                        <Skeleton className="h-12 w-32 rounded-lg" />
                        <Skeleton className="h-12 flex-1 rounded-lg" />
                    </div>
                    <Skeleton className="h-6 w-32 mb-4" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                </div>
            </div>
        </div>
      </div>
    );
  }
  
  if (!product) {
    const isSystemError = products.length === 0;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        {isSystemError ? (
           <>
             <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <RefreshCw className="h-8 w-8 text-red-500" />
             </div>
             <h2 className="text-2xl font-bold mb-2 text-gray-900">Failed to Load Product Data</h2>
             <p className="text-gray-500 mb-6 max-w-md">There was a problem loading the store inventory. Please refresh the page to try again.</p>
             <button onClick={() => window.location.reload()} className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700">
                Refresh Page
             </button>
           </>
        ) : (
           <>
             <h2 className="text-2xl font-bold mb-2 text-gray-900">Product Not Found</h2>
             <p className="text-gray-500 mb-6">The product you are looking for does not exist or has been removed.</p>
             <Link to="/shop" className="text-primary-600 font-bold hover:underline flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Return to Shop
             </Link>
           </>
        )}
      </div>
    );
  }

  const vendor = VENDORS.find(v => v.id === product.vendorId);
  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  // Fresh Produce Recommendations (Vegetables, Fruits, Tubers, Herbs)
  const produceCategories = [Category.VEGETABLES, Category.FRUITS, Category.TUBERS, Category.HERBS];
  const produceProducts = products
    .filter(p => produceCategories.includes(p.category) && p.id !== product.id && !relatedProducts.find(rp => rp.id === p.id))
    .slice(0, 8);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/shop" className="inline-flex items-center text-gray-500 hover:text-farm-600 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-16">
          {/* Image Gallery */}
          <div className="md:col-span-5 space-y-4">
            <div className="aspect-square overflow-hidden bg-gray-100 shadow-sm relative">
              <img 
                src={product.image} 
                alt={product.name} 
                className={`w-full h-full object-cover transition-opacity duration-300 ${isOutOfStock ? 'grayscale opacity-70' : ''}`} 
              />
              {isOutOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <span className="bg-red-600 text-white font-bold px-6 py-2 text-lg uppercase tracking-widest rounded-lg shadow-lg">
                          Out of Stock
                      </span>
                  </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="md:col-span-7">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-farm-600 font-bold uppercase tracking-wide text-sm">{product.category}</span>
                <div className="flex items-center text-yellow-500 text-sm font-bold">
                    <Star className="h-4 w-4 fill-current mr-1" />
                    {product.rating.toFixed(1)} ({product.reviews} reviews)
                </div>
            </div>
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4 leading-tight">{product.name}</h1>
            
            <div className="flex items-baseline gap-4 mb-6">
                <div className="text-3xl font-bold text-gray-900">
                    ₦{product.price.toLocaleString()} <span className="text-lg font-normal text-gray-500">/ {product.unit}</span>
                </div>
                {isLowStock && (
                    <span className="flex items-center gap-1 text-orange-600 text-sm font-bold bg-orange-50 px-2 py-1 rounded">
                        <AlertTriangle className="h-3 w-3" /> Only {product.stock} left!
                    </span>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className={`flex items-center border border-gray-300 rounded-lg w-fit ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-50 text-gray-600"
                  disabled={isOutOfStock}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 font-medium text-lg w-12 text-center">{quantity}</span>
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
                className={`flex-1 font-bold py-3 px-8 rounded-lg transition-colors shadow-lg transform ${
                    isOutOfStock 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                    : 'bg-[#143f17] hover:bg-farm-700 text-white hover:shadow-xl hover:-translate-y-0.5 cursor-pointer'
                }`}
              >
                {isOutOfStock ? 'Sold Out' : `Add to Cart - ₦${(product.price * quantity).toLocaleString()}`}
              </button>
            </div>

            {/* Description */}
            <h3 className="font-bold text-gray-900 mb-2 text-lg">Description</h3>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {product.description} Grown with care and harvested at the peak of freshness to ensure the best taste and nutrition for your family.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
               <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                 <Truck className="h-6 w-6 text-farm-600" />
                 <div>
                   <p className="font-bold text-sm">Next Day Delivery</p>
                   <p className="text-xs text-gray-500">Order by 2pm</p>
                 </div>
               </div>
               <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                 <ShieldCheck className="h-6 w-6 text-farm-600" />
                 <div>
                   <p className="font-bold text-sm">Freshness Guaranteed</p>
                   <p className="text-xs text-gray-500">100% money back</p>
                 </div>
               </div>
            </div>

            {/* Vendor Card */}
            {vendor && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 hover:border-farm-300 transition-colors">
                    <img src={vendor.image} alt={vendor.name} className="w-16 h-16 rounded-full object-cover border border-gray-200" />
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Sold by</p>
                        <h3 className="font-bold text-gray-900">{vendor.name}</h3>
                        <div className="flex items-center text-xs text-gray-500 gap-1">
                             <MapPin className="h-3 w-3" /> {vendor.location}
                        </div>
                    </div>
                    <Link to={`/vendors/${vendor.id}`} className="ml-auto text-sm text-farm-600 font-medium hover:underline">
                        View Profile
                    </Link>
                </div>
            )}
          </div>
        </div>
        
        {/* Reviews Section */}
        <div className="border-t border-gray-200 pt-12 pb-16">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8 flex items-center gap-2">
                Customer Reviews 
                <span className="text-sm font-sans font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {product.reviewsList?.length || 0}
                </span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Review Form */}
                <div className="lg:col-span-1 bg-gray-50 p-6 rounded-xl h-fit">
                    <h3 className="font-bold text-lg mb-4">Write a Review</h3>
                    {!user ? (
                        <div className="text-center py-6">
                            <p className="text-gray-600 mb-4">Please log in to share your experience with this product.</p>
                            <button 
                                onClick={() => setIsAuthModalOpen(true)}
                                className="bg-[#143f17] text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700 w-full"
                            >
                                Log In
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button 
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none"
                                        >
                                            <Star className={`h-8 w-8 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                                <textarea 
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="What did you like or dislike?"
                                    required
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={isSubmittingReview}
                                className="w-full bg-[#143f17] text-white py-2 rounded-lg font-bold hover:bg-primary-700 disabled:opacity-70 transition-colors"
                            >
                                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    )}
                </div>

                {/* Reviews List */}
                <div className="lg:col-span-2 space-y-6">
                    {product.reviewsList && product.reviewsList.length > 0 ? (
                        product.reviewsList.map((review) => (
                            <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                                            {review.userName.charAt(0)}
                                        </div>
                                        <span className="font-bold text-gray-900">{review.userName}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">{review.date}</span>
                                </div>
                                <div className="flex items-center mb-2">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                                <p className="text-gray-600">{review.comment}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 border border-dashed border-gray-300 rounded-xl">
                            <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Related Products */}
        <div className="border-t border-gray-200 pt-16">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">You Might Also Like</h2>
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 scrollbar-hide">
            {relatedProducts.length > 0 ? (
                relatedProducts.map((p) => (
                  <div key={p.id} className="w-36 sm:w-44 md:w-52 flex-shrink-0 snap-start">
                    <ProductCard product={p} />
                  </div>
                ))
            ) : (
                <p className="text-gray-500">No related products found.</p>
            )}
          </div>
        </div>

        {/* Fresh Produce Recommendations */}
        <div className="border-t border-gray-200 pt-16 mt-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-serif font-bold text-gray-900">Fresh Produce</h2>
                <Link to="/shop" className="text-primary-600 font-bold hover:underline flex items-center gap-1">
                    View All <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 scrollbar-hide">
                {produceProducts.length > 0 ? (
                    produceProducts.map((p) => (
                        <div key={p.id} className="w-36 sm:w-44 md:w-52 flex-shrink-0 snap-start">
                            <ProductCard product={p} />
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">More fresh produce coming soon!</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;