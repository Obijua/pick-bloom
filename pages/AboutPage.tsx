
import React from 'react';
import { Leaf, Users, Truck, Heart } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[400px] bg-[#0d2610] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
            <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80" alt="Farm" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d2610] to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center text-center">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 animate-fade-in-up">From Our Farms <br/> To Your Table</h1>
            <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-100">
                Connecting communities with local farmers to build a sustainable, healthy, and delicious future.
            </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                  <div className="space-y-6">
                      <div className="inline-block p-3 bg-primary-50 rounded-full text-primary-700 mb-2">
                          <Leaf className="h-6 w-6" />
                      </div>
                      <h2 className="text-3xl font-serif font-bold text-gray-900">Our Mission</h2>
                      <p className="text-gray-600 text-lg leading-relaxed">
                          Farmers Market was founded in 2023 with a simple goal: to make fresh, organic, and locally-sourced food accessible to everyone in Abuja while empowering local farmers.
                      </p>
                      <p className="text-gray-600 text-lg leading-relaxed">
                          We believe that food shouldn't travel thousands of miles to reach your plate. By cutting out the middlemen, we ensure farmers get paid fairly and you get produce that is fresher, tastier, and more nutritious.
                      </p>
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                      <img src="https://images.unsplash.com/photo-1595855709912-43b934898725?auto=format&fit=crop&q=80" alt="Market" className="w-full h-full object-cover" />
                  </div>
              </div>
          </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-serif font-bold text-gray-900 text-center mb-16">Why Choose Us</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Leaf className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">100% Organic</h3>
                      <p className="text-gray-600">We rigorously vet every vendor to ensure all produce is grown without harmful pesticides or GMOs.</p>
                  </div>
                  <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
                      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Truck className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Next-Day Delivery</h3>
                      <p className="text-gray-600">Harvested in the morning, delivered to your doorstep by the afternoon. Freshness guaranteed.</p>
                  </div>
                  <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
                      <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Heart className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Community First</h3>
                      <p className="text-gray-600">We support local economies by directing 90% of revenue back to the farmers and local artisans.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
             <h2 className="text-3xl font-serif font-bold text-gray-900 mb-12">Meet the Team</h2>
             <div className="flex flex-wrap justify-center gap-12">
                 <div className="w-64">
                     <div className="w-48 h-48 rounded-full overflow-hidden mx-auto mb-4 border-4 border-gray-100 shadow-md">
                         <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80" alt="CEO" className="w-full h-full object-cover" />
                     </div>
                     <h3 className="text-lg font-bold text-gray-900">David O.</h3>
                     <p className="text-primary-600">Founder & CEO</p>
                 </div>
                 <div className="w-64">
                     <div className="w-48 h-48 rounded-full overflow-hidden mx-auto mb-4 border-4 border-gray-100 shadow-md">
                         <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80" alt="COO" className="w-full h-full object-cover" />
                     </div>
                     <h3 className="text-lg font-bold text-gray-900">Amina K.</h3>
                     <p className="text-primary-600">Head of Operations</p>
                 </div>
                 <div className="w-64">
                     <div className="w-48 h-48 rounded-full overflow-hidden mx-auto mb-4 border-4 border-gray-100 shadow-md">
                         <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80" alt="CTO" className="w-full h-full object-cover" />
                     </div>
                     <h3 className="text-lg font-bold text-gray-900">John D.</h3>
                     <p className="text-primary-600">Lead Agronomist</p>
                 </div>
             </div>
          </div>
      </section>
    </div>
  );
};

export default AboutPage;
