
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Search, ArrowRight, Loader2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const ContactPage: React.FC = () => {
  const { settings } = useStore();
  const { addToast } = useToast();
  
  // Contact Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Order Tracking State
  const [trackingId, setTrackingId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [trackingError, setTrackingError] = useState('');
  const [isTracking, setIsTracking] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      // Simulate sending
      setTimeout(() => {
          addToast('Message sent successfully! We will get back to you soon.', 'success');
          setName('');
          setEmail('');
          setMessage('');
      }, 800);
  };

  const handleTrackOrder = async (e: React.FormEvent) => {
      e.preventDefault();
      setTrackingError('');
      setTrackedOrder(null);
      setIsTracking(true);
      
      const id = trackingId.trim();
      if (!id) {
          setTrackingError('Please enter an Order ID.');
          setIsTracking(false);
          return;
      }

      try {
          const order = await api.trackOrder(id);
          setTrackedOrder(order);
      } catch (error) {
          setTrackingError('Order not found. Please check the ID and try again.');
      } finally {
          setIsTracking(false);
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
              <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Get in Touch</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Have questions about our products, delivery, or want to become a vendor? We'd love to hear from you.
              </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              {/* Contact Info */}
              <div className="bg-[#0d2610] text-white rounded-2xl p-8 lg:col-span-1 shadow-lg h-full flex flex-col justify-between">
                  <div>
                      <h2 className="text-2xl font-serif font-bold mb-8">Contact Information</h2>
                      <div className="space-y-6">
                          <div className="flex items-start gap-4">
                              <Phone className="h-6 w-6 text-primary-400 mt-1" />
                              <div>
                                  <p className="font-bold text-lg mb-1">Phone</p>
                                  <p className="text-primary-100">{settings.contactPhone}</p>
                              </div>
                          </div>
                          <div className="flex items-start gap-4">
                              <Mail className="h-6 w-6 text-primary-400 mt-1" />
                              <div>
                                  <p className="font-bold text-lg mb-1">Email</p>
                                  <p className="text-primary-100">{settings.supportEmail}</p>
                              </div>
                          </div>
                          <div className="flex items-start gap-4">
                              <MapPin className="h-6 w-6 text-primary-400 mt-1" />
                              <div>
                                  <p className="font-bold text-lg mb-1">Headquarters</p>
                                  <p className="text-primary-100">Plot 453, Adetokunbo Ademola Crescent,<br/> Wuse 2, Abuja, Nigeria</p>
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  <div className="mt-12">
                      <div className="h-48 rounded-xl overflow-hidden bg-gray-800 opacity-80">
                         {/* Placeholder for Map */}
                         <div className="w-full h-full flex items-center justify-center text-gray-500 bg-white">
                             <span className="flex items-center gap-2"><MapPin/> View on Map</span>
                         </div>
                      </div>
                  </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-2xl p-8 lg:col-span-2 shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                  <form onSubmit={handleSendMessage} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                              <input 
                                  type="text" 
                                  required
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                  placeholder="John Doe"
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                              <input 
                                  type="email" 
                                  required
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                  placeholder="john@example.com"
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                          <textarea 
                              rows={5}
                              required
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                              placeholder="How can we help you?"
                          />
                      </div>
                      <button 
                          type="submit"
                          className="bg-primary-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-700 transition-all transform hover:-translate-y-0.5"
                      >
                          Send Message
                      </button>
                  </form>
              </div>
          </div>

          {/* Order Tracking Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-900 text-white p-8 text-center">
                  <h2 className="text-2xl font-serif font-bold mb-4">Track Your Order</h2>
                  <p className="text-gray-400 mb-6 max-w-lg mx-auto">Enter your Order ID below to check the current status of your delivery.</p>
                  
                  <form onSubmit={handleTrackOrder} className="max-w-md mx-auto relative flex">
                      <input 
                          type="text" 
                          value={trackingId}
                          onChange={(e) => setTrackingId(e.target.value)}
                          className="w-full pl-6 pr-14 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary-500/50"
                          placeholder="e.g. 65f2a..."
                          disabled={isTracking}
                      />
                      <button 
                          type="submit"
                          disabled={isTracking}
                          className="absolute right-2 top-2 bottom-2 bg-primary-600 text-white p-2.5 rounded-full hover:bg-primary-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                          {isTracking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                      </button>
                  </form>
                  {trackingError && <p className="text-red-400 mt-4 text-sm font-bold">{trackingError}</p>}
              </div>
              
              {trackedOrder && (
                  <div className="p-8 border-t border-gray-100 bg-gray-50 animate-fade-in-up">
                      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                          <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                              <div>
                                  <p className="text-sm text-gray-500">Order ID</p>
                                  <h3 className="text-xl font-bold text-gray-900">#{trackedOrder.id}</h3>
                              </div>
                              <div className="text-right">
                                  <p className="text-sm text-gray-500">Ordered On</p>
                                  <h3 className="text-lg font-bold text-gray-900">{trackedOrder.date}</h3>
                              </div>
                          </div>
                          
                          <div className="relative pt-8 pb-4">
                              <div className="h-1 bg-gray-200 absolute top-10 left-0 right-0 rounded-full overflow-hidden">
                                  <div 
                                      className="h-full bg-primary-600 transition-all duration-1000"
                                      style={{ 
                                          width: trackedOrder.status === 'Delivered' ? '100%' : 
                                                 trackedOrder.status === 'Shipped' ? '75%' : 
                                                 trackedOrder.status === 'Confirmed' ? '50%' : '25%' 
                                      }}
                                  ></div>
                              </div>
                              <div className="flex justify-between relative">
                                  {['Pending', 'Confirmed', 'Shipped', 'Delivered'].map((step, idx) => {
                                      const currentStatusIdx = ['Pending', 'Confirmed', 'Shipped', 'Delivered'].indexOf(trackedOrder.status);
                                      const isCompleted = idx <= currentStatusIdx;
                                      
                                      return (
                                          <div key={step} className="flex flex-col items-center">
                                              <div className={`w-5 h-5 rounded-full border-2 mb-2 z-10 ${isCompleted ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300'}`}></div>
                                              <span className={`text-xs font-bold ${isCompleted ? 'text-primary-700' : 'text-gray-400'}`}>{step}</span>
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>

                          <div className="mt-6 flex justify-center">
                               <p className="text-sm text-gray-500">
                                   Status: <span className="font-bold text-gray-900">{trackedOrder.status}</span>
                               </p>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default ContactPage;
