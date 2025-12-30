
import React from 'react';
import { MapPin, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router-dom';
import { Skeleton } from '../components/Skeleton';

const VendorPage: React.FC = () => {
  const { vendors, isLoading } = useStore();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Our Local Farmers</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Meet the hardworking families who bring fresh, organic food to your table. We partner with only the best local growers.
          </p>
        </div>

        <div className="space-y-8">
          {isLoading ? (
               // Loading Skeletons
               Array.from({ length: 3 }).map((_, i) => (
                   <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row p-4 gap-4">
                       <Skeleton className="md:w-1/3 h-64 md:h-auto rounded-xl" />
                       <div className="md:w-2/3 flex flex-col justify-center space-y-4">
                           <Skeleton className="h-8 w-1/2" />
                           <Skeleton className="h-4 w-1/4" />
                           <Skeleton className="h-20 w-full" />
                           <Skeleton className="h-10 w-32" />
                       </div>
                   </div>
               ))
          ) : vendors.map((vendor) => (
            <div key={vendor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
              <div className="md:w-1/3 h-64 md:h-auto relative">
                <img src={vendor.image} alt={vendor.name} className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="p-8 md:w-2/3 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{vendor.name}</h2>
                    <div className="flex items-center text-gray-500 gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{vendor.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                    <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                    <span className="font-bold text-yellow-700">{vendor.rating}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {vendor.description}
                </p>

                <div className="flex gap-4">
                  <Link 
                    to={`/vendors/${vendor.id}`}
                    className="bg-farm-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-farm-700 transition-colors"
                  >
                    View Products
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorPage;
