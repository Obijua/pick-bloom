
import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { CATEGORIES } from '../constants';
import { Category } from '../types';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';

const SLIDER_DATA = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80',
        title: 'Fresh Harvest Season',
        subtitle: 'Get 20% off all root vegetables this week',
        cta: 'Shop Tubers',
        link: '/shop?category=Tubers'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1615485500704-8e99099928b3?auto=format&fit=crop&q=80',
        title: 'Organic Meat & Poultry',
        subtitle: 'Ethically raised, hormone-free cuts for your family',
        cta: 'View Selection',
        link: '/shop?category=Meat%20%26%20Poultry'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80',
        title: 'Artisan Pantry Goods',
        subtitle: 'Homemade jams, honeys and fresh baked breads',
        cta: 'Explore Pantry',
        link: '/shop?category=Pantry%2FCooking%20Essentials'
    }
];

const HomePage: React.FC = () => {
  const { products, isLoading } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % SLIDER_DATA.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDER_DATA.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDER_DATA.length) % SLIDER_DATA.length);

  const getProductsByCategories = (cats: Category[]) => {
      return products.filter(p => cats.includes(p.category) && p.status !== 'Draft');
  };

  const sectionData = [
      {
          title: 'Produce',
          desc: 'Fresh fruits, vegetables, herbs & tubers',
          products: getProductsByCategories([Category.FRUITS, Category.VEGETABLES, Category.HERBS, Category.NUTS, Category.TUBERS]),
          link: '/shop'
      },
      {
          title: 'Meat & Poultry',
          desc: 'Locally raised beef, chicken & pork',
          products: getProductsByCategories([Category.MEAT]),
          link: '/shop?category=Meat%20%26%20Poultry'
      },
      {
          title: 'Dairy & Eggs',
          desc: 'Farm fresh milk, cheese & free-range eggs',
          products: getProductsByCategories([Category.DAIRY]),
          link: '/shop?category=Dairy%20%26%20Eggs'
      },
      {
          title: 'Pantry & Baked Goods',
          desc: 'Breads, grains, honey & essentials',
          products: getProductsByCategories([Category.PANTRY, Category.GRAINS]),
          link: '/shop?category=Pantry%2FCooking%20Essentials'
      }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-100 sticky top-16 md:top-16 z-30 shadow-sm overflow-x-auto scrollbar-hide">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-2 py-2 min-w-max">
                {CATEGORIES.map((cat, idx) => (
                    <Link 
                        key={idx} 
                        to={`/shop?category=${encodeURIComponent(cat.name)}`}
                        className="px-4 py-2 bg-primary-50 text-[#143f17] hover:bg-[#143f17] hover:text-white text-xs font-bold transition-all uppercase tracking-wide text-center whitespace-nowrap"
                    >
                        {cat.name}
                    </Link>
                ))}
            </div>
        </div>
      </div>

      <section className="relative h-62.5 md:h-87.5 overflow-hidden bg-gray-900 group">
        {SLIDER_DATA.map((slide, index) => (
            <div 
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            >
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center text-center">
                    <div className="max-w-3xl px-4 animate-fade-in-up">
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2 shadow-sm">{slide.title}</h2>
                        <p className="text-sm md:text-lg text-gray-100 mb-6 font-light">{slide.subtitle}</p>
                        <Link to={slide.link} className="inline-flex items-center gap-2 bg-[#f49f17] hover:bg-yellow-600 text-white px-6 py-2 rounded-full font-bold transition-all transform hover:scale-105 text-sm">
                            {slide.cta} <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        ))}
        
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-2 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100">
            <ChevronLeft className="h-6 w-6" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-2 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100">
            <ChevronRight className="h-6 w-6" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {SLIDER_DATA.map((_, idx) => (
                <button 
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-6' : 'bg-white/50'}`}
                />
            ))}
        </div>
      </section>

      <div className="py-8 space-y-12">
        {sectionData.map((section, idx) => (
             <section key={idx} className="max-w-480 mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                    <div>
                        <h2 className="text-xl font-serif font-bold text-gray-900">{section.title}</h2>
                    </div>
                    <Link to={section.link} className="text-[#143f17] font-bold hover:text-green-800 flex items-center gap-1 text-xs uppercase tracking-wider">
                        View All <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
                
                <div className="relative">
                    <div className="grid grid-rows-2 grid-flow-col gap-6 overflow-x-auto pb-4 scrollbar-hide">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="w-32 sm:w-36 md:w-36 lg:w-44 h-full">
                                    <ProductCardSkeleton />
                                </div>
                            ))
                        ) : section.products.length > 0 ? (
                            section.products.map((product) => (
                            <div key={product.id} className="w-32 sm:w-36 md:w-36 lg:w-44 h-full">
                                <ProductCard product={product} />
                            </div>
                            ))
                        ) : (
                            <div className="w-full text-center py-12 bg-gray-50 rounded-lg text-gray-400 col-span-full">
                                No products available.
                            </div>
                        )}
                    </div>
                </div>
             </section>
        ))}
      </div>

      <section className="py-16 bg-[#143f17] text-white relative overflow-hidden mt-8">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Join the Community</h2>
            <p className="text-primary-100 max-w-2xl mx-auto mb-8 text-lg">
                Weekly updates on seasonal harvests and exclusive offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input 
                    type="email" 
                    placeholder="Enter your email address" 
                    className="flex-1 pl-4 pr-4 py-3 rounded-none text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#f49f17]"
                />
                <button className="bg-[#f49f17] hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-none transition-colors uppercase tracking-wide">
                    Subscribe
                </button>
            </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
