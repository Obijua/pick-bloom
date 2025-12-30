
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, CheckCircle, ShoppingBag, ArrowLeft, CreditCard, Truck, AlertTriangle, Plus, X, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { NIGERIA_LOCATIONS } from '../constants';

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

const CheckoutPage: React.FC = () => {
  const { cart, cartTotal, user, setIsAuthModalOpen, placeOrder, settings, addAddress } = useStore();
  const navigate = useNavigate();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleteId, setOrderCompleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // React Hook Form for Address
  const { 
    register, 
    handleSubmit, 
    reset, 
    watch,
    setValue,
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

  // Dynamic Shipping Logic
  const isFreeShipping = cartTotal >= settings.freeShippingThreshold;
  const shippingCost = isFreeShipping ? 0 : settings.shippingCost;
  
  // Tax Logic
  const taxAmount = (cartTotal * settings.taxRate) / 100;
  
  const finalTotal = cartTotal + shippingCost + taxAmount;

  const onAddressSubmit = async (data: AddressFormData) => {
      // Ensure city and zip are strings
      const finalData = { 
          ...data, 
          zip: data.zip || '',
          city: data.city || ''
      };
      const newAddress = await addAddress(finalData);
      
      if (newAddress) {
          setSelectedAddressId(newAddress.id);
      }
      
      setIsAddressModalOpen(false);
      reset();
  };

  if (cart.length === 0 && !orderCompleteId && !isProcessing && !isPaymentModalOpen) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <h2 className="text-2xl font-serif font-bold text-gray-900">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">Add some fresh produce before checking out.</p>
              <Link to="/shop" className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700">Go to Shop</Link>
          </div>
      );
  }

  if (orderCompleteId) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 animate-scale-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Order Confirmed!</h2>
            <p className="text-gray-500 mb-2">Order ID: <span className="font-mono font-bold text-gray-900">#{orderCompleteId}</span></p>
            <p className="text-gray-500 mb-8 text-center max-w-md">
                Thank you for shopping with {settings.siteName}. Your order has been placed successfully and will be delivered to your selected address.
            </p>
            <div className="flex gap-4">
                <Link to="/profile" className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-50">View Order</Link>
                <Link to="/" className="bg-[#143f17] text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700">Continue Shopping</Link>
            </div>
        </div>
      );
  }

  const handlePlaceOrder = async () => {
      setError(null);
      if (!user) {
          setIsAuthModalOpen(true);
          return;
      }
      if (!selectedAddressId) {
          setError('Please select a delivery address to proceed.');
          return;
      }

      if (paymentMethod === 'card') {
          setIsPaymentModalOpen(true);
          return;
      }

      await executeOrderPlacement('Pay on Delivery');
  };

  const executeOrderPlacement = async (method: string) => {
      const shippingAddr = user!.addresses.find(a => a.id === selectedAddressId);
      if (!shippingAddr) {
          setError("Selected address invalid");
          return;
      }

      setIsProcessing(true);
      try {
          const orderId = await placeOrder({
              customerId: user!.id,
              customerName: user!.name,
              total: finalTotal,
              items: cart,
              paymentMethod: method,
              shippingAddress: shippingAddr
          });
          setOrderCompleteId(orderId);
      } catch (e) {
          setError("Failed to place order. Please try again.");
      } finally {
          setIsProcessing(false);
          setIsPaymentModalOpen(false);
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/shop" className="inline-flex items-center text-gray-500 hover:text-primary-600 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Shop
        </Link>
        
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
             
             {/* Delivery Address */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary-600" /> Delivery Address
                </h2>
                
                {user ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.addresses.map(addr => (
                            <div 
                                key={addr.id}
                                onClick={() => setSelectedAddressId(addr.id)}
                                className={`cursor-pointer rounded-xl p-4 border-2 transition-all ${
                                    selectedAddressId === addr.id 
                                    ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' 
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-gray-900">{addr.label}</span>
                                    {selectedAddressId === addr.id && <CheckCircle className="h-5 w-5 text-primary-600" />}
                                </div>
                                <p className="text-sm text-gray-600">{addr.street}</p>
                                <p className="text-sm text-gray-600">{addr.city}, {addr.state}</p>
                                <p className="text-xs text-gray-500 mt-2">{addr.phone}</p>
                            </div>
                        ))}
                         <button 
                            onClick={() => setIsAddressModalOpen(true)}
                            className="flex items-center justify-center rounded-xl p-4 border-2 border-dashed border-gray-300 text-gray-500 hover:text-primary-600 hover:border-primary-600 hover:bg-gray-50 transition-all font-medium gap-2"
                         >
                            <Plus className="h-5 w-5" /> Add New Address
                         </button>
                    </div>
                ) : (
                    <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <p className="font-bold text-primary-900">Have an account?</p>
                            <p className="text-sm text-primary-700">Sign in to access your saved addresses</p>
                        </div>
                        <button 
                            onClick={() => setIsAuthModalOpen(true)}
                            className="bg-white text-primary-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-50 shadow-sm"
                        >
                            Sign In
                        </button>
                    </div>
                )}
             </div>

             {/* Payment Method */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                 <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary-600" /> Payment Method
                 </h2>
                 <div className="space-y-3">
                     <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'bg-primary-50 border-primary-600' : 'border-gray-200 hover:border-gray-300'}`}>
                         <input 
                            type="radio" 
                            name="payment"
                            checked={paymentMethod === 'cod'} 
                            onChange={() => setPaymentMethod('cod')}
                            className="h-5 w-5 text-primary-600 focus:ring-primary-500" 
                        />
                         <div className="flex-1">
                             <p className="font-bold text-gray-900">Pay on Delivery</p>
                             <p className="text-sm text-gray-600">Pay with cash or transfer when you receive your items.</p>
                         </div>
                     </label>
                     <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'card' ? 'bg-primary-50 border-primary-600' : 'border-gray-200 hover:border-gray-300'}`}>
                         <input 
                            type="radio" 
                            name="payment"
                            checked={paymentMethod === 'card'} 
                            onChange={() => setPaymentMethod('card')}
                            className="h-5 w-5 text-primary-600 focus:ring-primary-500" 
                        />
                         <div className="flex-1">
                             <p className="font-bold text-gray-900">Credit / Debit Card</p>
                             <p className="text-sm text-gray-600">Secure payment via Paystack/Flutterwave</p>
                         </div>
                         <div className="flex gap-2">
                            <div className="h-6 w-8 bg-gray-200 rounded"></div>
                            <div className="h-6 w-8 bg-gray-200 rounded"></div>
                         </div>
                     </label>
                 </div>
             </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="max-h-64 overflow-y-auto mb-6 pr-2 space-y-4">
                    {cart.map(item => (
                        <div key={item.id} className="flex gap-3">
                            <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900 line-clamp-1">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.quantity} x ₦{item.price.toLocaleString()}</p>
                            </div>
                            <p className="font-bold text-gray-900">₦{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                    ))}
                </div>

                <div className="space-y-3 border-t border-gray-100 pt-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>₦{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        {shippingCost === 0 ? (
                            <span className="text-green-600 font-bold">Free</span>
                        ) : (
                            <span>₦{shippingCost.toLocaleString()}</span>
                        )}
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Tax ({settings.taxRate}%)</span>
                        <span>₦{taxAmount.toLocaleString()}</span>
                    </div>
                    {shippingCost > 0 && (
                        <div className="text-xs text-primary-600 bg-primary-50 p-2 rounded flex items-center gap-1">
                            <Truck className="h-3 w-3" />
                            Add ₦{(settings.freeShippingThreshold - cartTotal).toLocaleString()} more for free shipping
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center border-t border-gray-100 pt-4 mb-6">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-primary-600">₦{finalTotal.toLocaleString()}</span>
                </div>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        {error}
                    </div>
                )}

                <button 
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="w-full bg-[#143f17] text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <>
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </>
                    ) : (
                        `Confirm Order - ₦${finalTotal.toLocaleString()}`
                    )}
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {isAddressModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsAddressModalOpen(false)} />
              <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-scale-in">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Add New Address</h3>
                      <button onClick={() => setIsAddressModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                          <X className="h-6 w-6" />
                      </button>
                  </div>
                  
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

                        <div className="md:col-span-2 pt-4">
                            <button type="submit" className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700">
                                Save Address
                            </button>
                        </div>
                    </form>
              </div>
          </div>
      )}

      {/* Payment Simulation Modal */}
      {isPaymentModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isProcessing && setIsPaymentModalOpen(false)} />
              <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                  <div className="bg-gray-900 px-6 py-4 flex justify-between items-center text-white">
                      <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          <span className="font-bold">Secure Payment</span>
                      </div>
                      <button onClick={() => setIsPaymentModalOpen(false)} disabled={isProcessing} className="text-gray-400 hover:text-white">
                          <X className="h-5 w-5" />
                      </button>
                  </div>
                  
                  <div className="p-8 text-center">
                        <div className="mb-6">
                            <p className="text-gray-500 text-sm uppercase tracking-wide mb-1">Total Amount</p>
                            <p className="text-3xl font-bold text-gray-900">₦{finalTotal.toLocaleString()}</p>
                        </div>

                        {isProcessing ? (
                             <div className="py-8">
                                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-600 font-medium">Processing your payment...</p>
                                <p className="text-xs text-gray-400 mt-2">Please do not close this window</p>
                             </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>Card Number</span>
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                            <span>4242</span>
                                        </div>
                                    </div>
                                    <button 
                                        className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors shadow-lg"
                                        onClick={() => executeOrderPlacement('Card Payment')}
                                    >
                                        Pay ₦{finalTotal.toLocaleString()}
                                    </button>
                                </div>
                                <div className="flex justify-center gap-2 text-xs text-gray-400">
                                    <span>Powered by</span>
                                    <span className="font-bold text-gray-600">Paystack</span>
                                    <span>/</span>
                                    <span className="font-bold text-gray-600">Flutterwave</span>
                                </div>
                            </div>
                        )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default CheckoutPage;
