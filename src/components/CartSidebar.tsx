
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const CartSidebar: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal, settings } = useStore();
  const navigate = useNavigate();

  // Free shipping threshold logic from settings
  const FREE_SHIPPING_THRESHOLD = settings.freeShippingThreshold;
  const progress = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = FREE_SHIPPING_THRESHOLD - cartTotal;

  const handleCheckout = () => {
      setIsCartOpen(false);
      navigate('/checkout');
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-60 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" 
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Sidebar */}
      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 flex flex-col h-dvh">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-10 shrink-0">
          <div className="flex items-center gap-3">
             <h2 className="text-xl font-bold font-serif text-gray-900">My Cart</h2>
             <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded-full">
                {cart.length} items
             </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Tablet/Mobile Checkout Button */}
            {cart.length > 0 && (
                <button
                    onClick={handleCheckout}
                    className="lg:hidden bg-[#143f17] text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-primary-700 transition-colors shadow-sm"
                >
                    Checkout
                </button>
            )}
            <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
                <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Free Shipping Progress */}
        {cart.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2 mb-2 text-sm">
                    <Truck className="h-4 w-4 text-primary-600" />
                    {remaining > 0 ? (
                        <span className="text-gray-600">
                            Add <span className="font-bold text-gray-900">₦{remaining.toLocaleString()}</span> for <span className="text-primary-600 font-bold">Free Shipping</span>
                        </span>
                    ) : (
                        <span className="text-primary-700 font-bold">You've unlocked Free Shipping!</span>
                    )}
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-primary-500 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="bg-gray-50 p-6 rounded-full mb-4">
                  <ShoppingBag className="h-12 w-12 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto">Looks like you haven't added any fresh produce to your cart yet.</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="bg-[#143f17] text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  {/* Image */}
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 text-base line-clamp-2">{item.name}</h3>
                        <p className="font-bold text-gray-900 ml-2">₦{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                      <p className="text-xs text-gray-500 capitalize">{item.unit} price: ₦{item.price.toLocaleString()}</p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Control */}
                      <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-gray-600 transition-all disabled:opacity-50"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
                        <button 
                           onClick={() => updateQuantity(item.id, item.quantity + 1)}
                           className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-gray-600 transition-all"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Summary */}
        {cart.length > 0 && (
          <div className="bg-white border-t border-gray-100 p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0 z-20">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-800 text-sm">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">₦{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-800 text-sm">
                 <span>Shipping</span>
                 <span className="text-gray-600 italic text-xs">Calculated at checkout</span>
              </div>
              <div className="flex justify-between items-end border-t border-gray-100 pt-3">
                 <span className="text-base font-bold text-gray-900">Total</span>
                 <span className="text-2xl font-bold text-primary-700">₦{cartTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 bg-[#143f17] text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              Checkout <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
