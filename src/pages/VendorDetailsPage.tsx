
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import { MapPin, Star, ArrowLeft } from 'lucide-react';
import { ProductCardSkeleton, Skeleton } from '../components/Skeleton';

const VendorDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, vendors, isLoading } = useStore();

  if (isLoading) {
      return (
          <div className="min-h-screen bg-gray-50 pb-16 pt-12 px-4">
               <div className="max-w-7xl mx-auto space-y-8">
                   <div className="flex gap-6 items-center">
                       <Skeleton className="w-32 h-32 rounded-full" />
                       <div className="space-y-4 flex-1">
                           <Skeleton className="h-10 w-1/2" />
                           <Skeleton className="h-4 w-1/4" />
                           <Skeleton className="h-20 w-3/4" />
                       </div>
                   </div>
                   <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
                       {Array.from({length: 5}).map((_, i) => <ProductCardSkeleton key={i} />)}
                   </div>
               </div>
          </div>
      )
  }

  const vendor = vendors.find(v => v.id === id);
  
  if (!vendor) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center">
              <h2 className="text-2xl font-bold mb-4">Vendor Not Found</h2>
              <Link to="/vendors" className="text-primary-600 hover:underline">Return to Vendors</Link>
          </div>
      );
  }

  const vendorProducts = products.filter(p => p.vendorId === vendor.id);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
        {/* Vendor Header */}
        <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Link to="/vendors" className="inline-flex items-center text-gray-500 hover:text-primary-600 mb-8 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to All Vendors
                </Link>
                
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                        <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">{vendor.name}</h1>
                            <div className="flex items-center bg-yellow-50 px-4 py-1.5 rounded-full border border-yellow-100 w-fit">
                                <Star className="h-5 w-5 text-yellow-500 fill-current mr-1.5" />
                                <span className="font-bold text-yellow-700 text-lg">{vendor.rating}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center text-gray-600 mb-6">
                             <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                             <span className="font-medium">{vendor.location}</span>
                        </div>

                        <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
                            {vendor.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-4">
                Products from {vendor.name} <span className="text-gray-400 font-normal text-lg ml-2">({vendorProducts.length})</span>
            </h2>

            {vendorProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
                    {vendorProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500 text-lg">No products available at the moment.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default VendorDetailsPage;
