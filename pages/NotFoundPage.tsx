
import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Home, Search } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
        <Leaf className="h-12 w-12 text-primary-600" />
      </div>
      
      <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-xl md:text-2xl font-medium text-gray-800 mb-6">Page Not Found</h2>
      
      <p className="text-gray-500 max-w-md mb-8">
        Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          to="/" 
          className="flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-700 transition-colors"
        >
          <Home className="h-5 w-5" /> Back to Home
        </Link>
        <Link 
          to="/shop" 
          className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors"
        >
          <Search className="h-5 w-5" /> Browse Shop
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
