
import React, { useState } from 'react';
import { Leaf, Instagram, Facebook, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Category } from '../types';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';

const Footer: React.FC = () => {
  const { settings } = useStore();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
        addToast('Thanks for subscribing to our newsletter!', 'success');
        setEmail('');
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-primary-900 p-1.5 rounded-full group-hover:bg-primary-800 transition-colors">
                    <Leaf className="h-6 w-6 text-primary-500" />
                </div>
                <span className="text-xl font-bold font-serif">{settings.siteName}</span>
              </Link>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Connecting communities with local farmers. We believe in fresh, sustainable, and ethically sourced food for everyone.
            </p>
            <div className="space-y-2 pt-2">
                <div className="flex items-center gap-3 text-sm text-gray-400 group">
                    <MapPin className="h-4 w-4 group-hover:text-primary-500 transition-colors" /> 
                    <span>FCT - Abuja, Nigeria</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400 group">
                    <Phone className="h-4 w-4 group-hover:text-primary-500 transition-colors" /> 
                    <span>{settings.contactPhone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400 group">
                    <Mail className="h-4 w-4 group-hover:text-primary-500 transition-colors" /> 
                    <span>{settings.supportEmail}</span>
                </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6 relative inline-block">
                Shop
                <span className="absolute bottom-[-8px] left-0 w-8 h-1 bg-primary-600 rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li><Link to={`/shop?category=${encodeURIComponent(Category.VEGETABLES)}`} className="hover:text-primary-500 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gray-600 rounded-full"></span> Vegetables</Link></li>
              <li><Link to={`/shop?category=${encodeURIComponent(Category.FRUITS)}`} className="hover:text-primary-500 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gray-600 rounded-full"></span> Fruits</Link></li>
              <li><Link to={`/shop?category=${encodeURIComponent(Category.DAIRY)}`} className="hover:text-primary-500 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gray-600 rounded-full"></span> Dairy & Eggs</Link></li>
              <li><Link to={`/shop?category=${encodeURIComponent(Category.MEAT)}`} className="hover:text-primary-500 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gray-600 rounded-full"></span> Meat & Poultry</Link></li>
              <li><Link to={`/shop?category=${encodeURIComponent(Category.PANTRY)}`} className="hover:text-primary-500 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gray-600 rounded-full"></span> Artisan Goods</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6 relative inline-block">
                Company
                <span className="absolute bottom-[-8px] left-0 w-8 h-1 bg-primary-600 rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="hover:text-primary-500 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gray-600 rounded-full"></span> About Us</Link></li>
              <li><Link to="/vendors" className="hover:text-primary-500 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gray-600 rounded-full"></span> Our Farmers</Link></li>
              <li><Link to="/contact" className="hover:text-primary-500 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gray-600 rounded-full"></span> Contact Support</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-500 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gray-600 rounded-full"></span> Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary-500 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gray-600 rounded-full"></span> Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6 relative inline-block">
                Stay Connected
                <span className="absolute bottom-[-8px] left-0 w-8 h-1 bg-primary-600 rounded-full"></span>
            </h3>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">Subscribe to our newsletter for seasonal harvest updates and exclusive offers.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 w-full text-sm focus:ring-2 focus:ring-primary-600 focus:outline-none text-white placeholder-gray-500 transition-all"
              />
              <button type="submit" className="bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-900/20">
                <Mail className="h-5 w-5" />
              </button>
            </form>
            <div className="flex gap-4 mt-8">
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-primary-600 hover:text-white transition-all transform hover:-translate-y-1"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-primary-600 hover:text-white transition-all transform hover:-translate-y-1"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-primary-600 hover:text-white transition-all transform hover:-translate-y-1"><Twitter className="h-5 w-5" /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/about" className="hover:text-primary-400 transition-colors">About</Link>
            <Link to="/contact" className="hover:text-primary-400 transition-colors">Support</Link>
            <Link to="/admin" className="hover:text-primary-400 transition-colors">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
