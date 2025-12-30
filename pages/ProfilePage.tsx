
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Plus, Trash2, Camera, Save, Edit2, ShoppingBag, X, Package, ChevronRight, Clock, AlertTriangle, Send, RefreshCcw, XCircle } from 'lucide-react';
import { Address, Order, OrderStatus } from '../types';
import { NIGERIA_LOCATIONS } from '../constants';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const addressSchema = z.object({
  label: z.string().min(2, "Label is required (e.g. Home, Work)"),
  street: z.string().min(5, "Please enter a valid street address"),
  landmark: z.string().optional(),
  state: z.string().min(1, "State is required"),
  lga: z.string().min(1, "LGA is required"),
  city: z.string().optional(),
  phone: z.string().regex(/^[0-9]{11}$/, "Phone number must be 11 digits"),
  zip: z.string().optional()
});

type AddressFormData = z.infer<typeof addressSchema>;

const ProfilePage: React.FC = () => {
  const { user, updateUserProfile, addAddress, editAddress, removeAddress, logout, orders, resendVerificationEmail, refreshStore, isLoading, cancelOrder } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile');
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Auto-polling for real-time updates
  useEffect(() => {
      const interval = setInterval(() => {
          refreshStore();
      }, 10000); // Poll every 10 seconds

      return () => clearInterval(interval);
  }, []);

  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue, 
    watch,
    formState: { errors } 
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
        label: 'Home',
        state: 'FCT',
        phone: '',
        street: '',
        lga: '',
        landmark: '',
        city: ''
    }
  });

  const watchState = watch('state');
  const availableLGAs = NIGERIA_LOCATIONS[watchState] || [];

  React.useEffect(() => {
     const currentLga = watch('lga');
     if (watchState && availableLGAs.length > 0 && !availableLGAs.includes(currentLga)) {
         setValue('lga', availableLGAs[0]);
     }
  }, [watchState, availableLGAs, setValue, watch]);

  const myOrders = orders.filter(o => o.customerId === user?.id);

  // Sync selected order with latest data if open
  useEffect(() => {
      if (selectedOrder) {
          const updated = orders.find(o => o.id === selectedOrder.id);
          if (updated) setSelectedOrder(updated);
      }
  }, [orders, selectedOrder]);

  if (!user) {
    return (
        <div className="min-h-screen flex items-center justify-center flex-col gap-4">
            <p className="text-lg text-gray-600">Please log in to view your profile.</p>
            <button onClick={() => navigate('/')} className="text-primary-600 font-bold">Go Home</button>
        </div>
    );
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
      e.preventDefault();
      updateUserProfile({ name, email });
  };

  const handleResend = async () => {
      setIsResending(true);
      await resendVerificationEmail();
      setIsResending(false);
  };

  const handleRefreshOrders = async () => {
      setIsRefreshingOrders(true);
      await refreshStore();
      setIsRefreshingOrders(false);
  };

  const handleCancelOrder = async (orderId: string) => {
      if (window.confirm("Are you sure you want to cancel this order?")) {
          setIsCancelling(true);
          await cancelOrder(orderId);
          setIsCancelling(false);
      }
  };

  const onAddressSubmit = (data: AddressFormData) => {
      const finalData = { 
          ...data, 
          zip: data.zip || '',
          city: data.city || ''
      };
      
      if (editingAddressId) {
        editAddress(editingAddressId, finalData);
      } else {
        addAddress(finalData);
      }
      setShowAddressForm(false);
      setEditingAddressId(null);
      reset();
  };

  const startEditAddress = (addr: Address) => {
      setEditingAddressId(addr.id);
      setValue('label', addr.label);
      setValue('street', addr.street);
      setValue('landmark', addr.landmark || '');
      setValue('state', addr.state);
      setValue('lga', addr.lga);
      setValue('city', addr.city);
      setValue('phone', addr.phone);
      setValue('zip', addr.zip);
      setShowAddressForm(true);
  };

  const cancelEdit = () => {
      setShowAddressForm(false);
      setEditingAddressId(null);
      reset({
        label: 'Home',
        state: 'FCT',
        phone: '',
        street: '',
        lga: '',
        landmark: '',
        city: ''
      });
  }

  const getStatusColor = (status: OrderStatus) => {
      switch (status) {
          case 'Confirmed': return 'bg-blue-100 text-blue-800';
          case 'Shipped': return 'bg-purple-100 text-purple-800';
          case 'Delivered': return 'bg-green-100 text-green-800';
          case 'Cancelled': return 'bg-red-100 text-red-800';
          default: return 'bg-yellow-100 text-yellow-800'; 
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">My Account</h1>
        
        {/* Verification Warning Banner */}
        {user.isVerified === false && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-yellow-800">Action Required</p>
                        <p className="text-sm text-yellow-700">Please verify your email to enjoy seamless services from Farmers Market.</p>
                    </div>
                </div>
                <button 
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-sm bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-medium hover:bg-yellow-200 transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                >
                    <Send className="h-4 w-4" /> {isResending ? 'Sending...' : 'Resend Link'}
                </button>
            </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-64 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-sm p-6 text-center mb-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-primary-100 relative group">
                        <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="text-white h-6 w-6" />
                        </div>
                    </div>
                    <h2 className="font-bold text-gray-900">{user.name}</h2>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-1">{user.status === 'Blocked' ? 'Account Suspended' : 'Member since ' + (user.joinDate || '2023')}</p>
                </div>
                
                <nav className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`w-full text-left px-6 py-4 border-b border-gray-100 flex items-center gap-3 transition-colors ${activeTab === 'profile' ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                        <User className="h-5 w-5" /> Profile Details
                    </button>
                    <button 
                        onClick={() => setActiveTab('orders')}
                        className={`w-full text-left px-6 py-4 border-b border-gray-100 cursor-pointer flex items-center gap-3 transition-colors ${activeTab === 'orders' ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                        <ShoppingBag className="h-5 w-5" /> My Orders
                    </button>
                    <button 
                        onClick={() => setActiveTab('addresses')}
                        className={`w-full text-left px-6 py-4 border-b border-gray-100 cursor-pointer flex items-center gap-3 transition-colors ${activeTab === 'addresses' ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                        <MapPin className="h-5 w-5" /> Address Book
                    </button>
                    <button 
                        onClick={() => { logout(); navigate('/'); }}
                        className="w-full text-left px-6 py-4 cursor-pointer text-red-500 hover:bg-red-50 transition-colors"
                    >
                        Sign Out
                    </button>
                </nav>
            </aside>

            <div className="flex-1">
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <h2 className="text-xl font-bold mb-6">Edit Profile</h2>
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <button className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors font-medium">
                                <Save className="h-4 w-4" /> Save Changes
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Order History</h2>
                            <button 
                                onClick={handleRefreshOrders} 
                                disabled={isRefreshingOrders || isLoading}
                                className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-200 hover:border-primary-600"
                            >
                                <RefreshCcw className={`h-4 w-4 ${isRefreshingOrders ? 'animate-spin' : ''}`} />
                                {isRefreshingOrders ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                        
                        {myOrders.length === 0 ? (
                            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
                                <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900">No orders yet</h3>
                                <p className="text-gray-500 mb-6">Looks like you haven't made any purchases yet.</p>
                                <button 
                                    onClick={() => navigate('/shop')}
                                    className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700"
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myOrders.map(order => (
                                    <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-primary-200 transition-colors">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-gray-100 pb-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-gray-900">{order.id}</h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                    <Clock className="h-3 w-3" /> {order.date}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-lg text-primary-700">₦{order.total.toLocaleString()}</p>
                                                <p className="text-xs text-gray-500">{order.items.length} items</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <div className="flex -space-x-3 overflow-hidden">
                                                {order.items.slice(0, 4).map((item, idx) => (
                                                    <div key={idx} className="h-10 w-10 rounded-full ring-2 ring-white bg-gray-100 overflow-hidden">
                                                        <img src={item.image} alt="" className="h-full w-full object-cover" />
                                                    </div>
                                                ))}
                                                {order.items.length > 4 && (
                                                    <div className="h-10 w-10 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                                        +{order.items.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <button 
                                                onClick={() => setSelectedOrder(order)}
                                                className="flex items-center gap-1 text-primary-600 font-bold text-sm hover:underline"
                                            >
                                                View Details <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'addresses' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                             <h2 className="text-xl font-bold">Address Book</h2>
                             <button 
                                onClick={() => {
                                    cancelEdit();
                                    setShowAddressForm(true);
                                }}
                                className="text-sm bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
                             >
                                <Plus className="h-4 w-4" /> Add New
                             </button>
                        </div>

                        {showAddressForm && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-primary-100 animate-fade-in-up">
                                <h3 className="font-bold mb-4 text-sm uppercase tracking-wide text-gray-500">
                                    {editingAddressId ? 'Edit Address' : 'New Address'}
                                </h3>
                                <form onSubmit={handleSubmit(onAddressSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Label (e.g. Home, Work)</label>
                                        <input 
                                            {...register('label')}
                                            className={`w-full px-3 py-2 border rounded-md ${errors.label ? 'border-red-500' : 'border-gray-300'}`} 
                                        />
                                        {errors.label && <p className="text-red-500 text-xs mt-1">{errors.label.message}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Street Address</label>
                                        <input 
                                            {...register('street')}
                                            className={`w-full px-3 py-2 border rounded-md ${errors.street ? 'border-red-500' : 'border-gray-300'}`} 
                                        />
                                        {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Landmark (Optional)</label>
                                        <input 
                                            {...register('landmark')}
                                            className="w-full px-3 py-2 border rounded-md border-gray-300" 
                                            placeholder="e.g. Near Shoprite" 
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">State</label>
                                        <select 
                                            {...register('state')}
                                            className="w-full px-3 py-2 border rounded-md bg-white border-gray-300"
                                        >
                                            {Object.keys(NIGERIA_LOCATIONS).map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">LGA</label>
                                        <select 
                                            {...register('lga')}
                                            className={`w-full px-3 py-2 border rounded-md bg-white ${errors.lga ? 'border-red-500' : 'border-gray-300'}`}
                                        >
                                            <option value="">Select LGA</option>
                                            {availableLGAs.map(lga => (
                                                <option key={lga} value={lga}>{lga}</option>
                                            ))}
                                        </select>
                                        {errors.lga && <p className="text-red-500 text-xs mt-1">{errors.lga.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">City/Area (Optional)</label>
                                        <input 
                                            {...register('city')}
                                            className="w-full px-3 py-2 border rounded-md border-gray-300" 
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number</label>
                                        <input 
                                            type="tel" 
                                            {...register('phone')}
                                            className={`w-full px-3 py-2 border rounded-md ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="080..." 
                                        />
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                                    </div>

                                    <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                                        <button type="button" onClick={cancelEdit} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancel</button>
                                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                                            {editingAddressId ? 'Update Address' : 'Save Address'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="grid gap-4">
                            {user.addresses.map((addr) => (
                                <div key={addr.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start group hover:border-primary-200 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-gray-50 rounded-full text-gray-400 group-hover:text-primary-600 group-hover:bg-primary-50 transition-colors">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-gray-900">{addr.label}</h3>
                                                {addr.landmark && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">{addr.landmark}</span>}
                                            </div>
                                            <p className="text-gray-600 text-sm mt-1">{addr.street}</p>
                                            <p className="text-gray-600 text-sm">{addr.lga}, {addr.state}</p>
                                            <p className="text-gray-500 text-xs mt-2">{addr.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => startEditAddress(addr)}
                                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                                            title="Edit address"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => removeAddress(addr.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                            title="Remove address"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {user.addresses.length === 0 && (
                                <p className="text-gray-500 italic text-center py-8">No addresses saved yet.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div 
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setSelectedOrder(null)}
              />
              <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
                  <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                        <p className="text-sm text-gray-500">#{selectedOrder.id}</p>
                      </div>
                      <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                          <X className="h-6 w-6" />
                      </button>
                  </div>

                  <div className="p-6 space-y-6">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                           <div>
                               <p className="text-sm text-gray-500 mb-1">Status</p>
                               <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(selectedOrder.status)}`}>
                                   {selectedOrder.status}
                               </span>
                           </div>
                           <div className="text-right">
                               <p className="text-sm text-gray-500 mb-1">Order Date</p>
                               <p className="font-medium">{selectedOrder.date}</p>
                           </div>
                      </div>

                      <div className="space-y-4">
                          <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500">Items</h3>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                              {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                                  <div key={idx} className="flex gap-4">
                                      <div className="h-16 w-16 bg-white rounded border border-gray-200 overflow-hidden flex-shrink-0">
                                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                                      </div>
                                      <div className="flex-1">
                                          <div className="flex justify-between items-start">
                                              <h4 className="font-bold text-gray-900">{item.name}</h4>
                                              <span className="font-medium text-gray-900">₦{(item.price * item.quantity).toLocaleString()}</span>
                                          </div>
                                          <p className="text-sm text-gray-500">{item.quantity} x ₦{item.price.toLocaleString()}</p>
                                          <p className="text-xs text-gray-400 mt-1">{item.unit}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                          <span className="font-bold text-gray-900 text-lg">Total</span>
                          <span className="font-bold text-primary-600 text-2xl">₦{selectedOrder.total.toLocaleString()}</span>
                      </div>
                  </div>

                  {selectedOrder.status === 'Pending' && (
                      <div className="p-4 bg-red-50 border-t border-red-100 flex justify-between items-center">
                          <p className="text-sm text-red-600 font-medium flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" /> Want to cancel this order?
                          </p>
                          <button 
                              onClick={() => handleCancelOrder(selectedOrder.id)}
                              disabled={isCancelling}
                              className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-colors"
                          >
                              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default ProfilePage;
