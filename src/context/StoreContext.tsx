/*
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Product, User, Address, Order, OrderStatus, AppSettings, Review, Vendor } from '../types';
import { useToast } from './ToastContext';
import { api } from '../services/api';

interface StoreContextType {
  isLoading: boolean;
  isError: boolean;
  retryConnection: () => Promise<void>;
  refreshStore: () => Promise<void>;
  products: Product[];
  vendors: Vendor[];
  addVendor: (vendor: Omit<Vendor, 'id'>) => Promise<void>;
  updateVendor: (id: string, data: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviews' | 'reviewsList'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  addProductReview: (productId: string, review: Omit<Review, 'id' | 'date'>) => Promise<void>;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  user: User | null;
  allUsers: User[];
  refreshUsers: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<string | null>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
  resendVerificationEmail: () => Promise<void>;
  registerUser: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<Address | undefined>;
  editAddress: (id: string, updatedAddress: Omit<Address, 'id'>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  blockUser: (id: string) => Promise<void>;
  unblockUser: (id: string) => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (isOpen: boolean) => void;
  incomingResetToken: string | null;
  openResetModal: (token: string) => void;
  // Order Management
  orders: Order[];
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
  placeOrder: (orderData: Omit<Order, 'id' | 'date' | 'status'>) => Promise<string>;
  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  // Settings
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  // Quick View
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Global State with Persistence initialization
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('FM_CART');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('FM_WISHLIST');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('FM_SESSION_USER');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [incomingResetToken, setIncomingResetToken] = useState<string | null>(null);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
      shippingCost: 1500,
      freeShippingThreshold: 50000,
      taxRate: 0,
      siteName: 'Farmers Market',
      supportEmail: 'support@farmersmarket.com',
      contactPhone: '+234 800 000 0000'
  });
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('FM_CART', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('FM_WISHLIST', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (user) {
        localStorage.setItem('FM_SESSION_USER', JSON.stringify(user));
    } else {
        localStorage.removeItem('FM_SESSION_USER');
    }
  }, [user]);

  // Optimized Data Fetching: Split Public vs Protected
  const fetchPublicData = async () => {
      try {
          setIsError(false);
          const [fetchedProducts, fetchedVendors, fetchedSettings] = await Promise.all([
              api.getProducts(),
              api.getVendors(),
              api.getSettings()
          ]);
          setProducts(fetchedProducts);
          setVendors(fetchedVendors);
          setSettings(fetchedSettings);
      } catch (e) {
          console.error("Failed to load public data", e);
          setIsError(true);
      }
  };

  const fetchUserData = async () => {
      if (!user) {
          setOrders([]);
          setAllUsers([]);
          return;
      }
      try {
          const promises: Promise<any>[] = [api.getOrders()];
          if (user.role === 'admin') {
              promises.push(api.getUsers());
          }
          
          const results = await Promise.allSettled(promises);
          
          if (results[0].status === 'fulfilled') setOrders(results[0].value);
          if (user.role === 'admin' && results[1] && results[1].status === 'fulfilled') {
              setAllUsers(results[1].value);
          }
      } catch (e) {
          console.error("Failed to load user data", e);
          // Don't set global error here to allow partial functionality if user data fails
      }
  };

  const init = async () => {
      setIsLoading(true);
      await fetchPublicData(); // Load products immediately so users see them
      await fetchUserData();   // Then load user specific stuff
      setIsLoading(false);
  };

  // Initial Load
  useEffect(() => {
      init();
  }, []);

  // Reload user data when user changes
  useEffect(() => {
      fetchUserData();
  }, [user]);

  // Robust Refresh for Polling
  const refreshStore = async () => {
      if (isError) return; // Don't auto-refresh if in error state
      await fetchPublicData();
      await fetchUserData();
  };

  const retryConnection = async () => {
      await init();
  }

  const refreshUsers = useCallback(async () => {
      if (user && user.role === 'admin') {
          try {
              const users = await api.getUsers();
              setAllUsers(users);
          } catch (e) {
              console.error("Failed to refresh users", e);
          }
      }
  }, [user]);

  // --- Vendor Actions ---
  const addVendor = async (vendorData: Omit<Vendor, 'id'>) => {
      try {
          const newVendor = await api.addVendor(vendorData);
          setVendors(prev => [newVendor, ...prev]);
          addToast('Vendor added successfully', 'success');
      } catch (e: any) {
          addToast(e.message || 'Failed to add vendor', 'error');
      }
  };

  const updateVendor = async (id: string, data: Partial<Vendor>) => {
      try {
          const updated = await api.updateVendor(id, data);
          setVendors(prev => prev.map(v => v.id === id ? updated : v));
          addToast('Vendor updated successfully', 'success');
      } catch (e: any) {
          addToast(e.message || 'Failed to update vendor', 'error');
      }
  };

  const deleteVendor = async (id: string) => {
      try {
          await api.deleteVendor(id);
          setVendors(prev => prev.filter(v => v.id !== id));
          addToast('Vendor deleted', 'info');
      } catch (e: any) {
          addToast(e.message || 'Failed to delete vendor', 'error');
      }
  };

  // --- Admin Product Actions ---
  const addProduct = async (productData: Omit<Product, 'id' | 'rating' | 'reviews' | 'reviewsList'>) => {
    try {
        const newProduct = await api.addProduct(productData);
        setProducts(prev => [newProduct, ...prev]);
        addToast('Product added successfully', 'success');
    } catch (e: any) {
        addToast(e.message || 'Failed to add product', 'error');
    }
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
      try {
        const updated = await api.updateProduct(id, data);
        setProducts(prev => prev.map(p => p.id === id ? updated : p));
        if (!data.reviewsList && !data.stock) { 
           addToast('Product updated successfully', 'success');
        }
      } catch (e: any) {
        addToast(e.message || 'Failed to update product', 'error');
      }
  };

  const addProductReview = async (productId: string, review: Omit<Review, 'id' | 'date'>) => {
    try {
        const updatedProduct = await api.addReview(productId, review);
        setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
        addToast('Review submitted successfully', 'success');
    } catch (e: any) {
        addToast(e.message || 'Failed to submit review', 'error');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
        await api.deleteProduct(id);
        setProducts(prev => prev.filter(p => p.id !== id));
        removeFromCart(id);
        addToast('Product deleted', 'info');
    } catch (e: any) {
        addToast(e.message || 'Failed to delete product', 'error');
    }
  };

  // --- Order Actions ---
  const updateOrderStatus = async (id: string, status: OrderStatus) => {
      try {
          const updated = await api.updateOrderStatus(id, status);
          setOrders(prev => prev.map(o => o.id === id ? updated : o));
          addToast(`Order #${id} marked as ${status}`, 'success');
      } catch (e: any) {
          addToast(e.message || 'Failed to update order status', 'error');
      }
  };

  const cancelOrder = async (id: string) => {
      try {
          const updated = await api.cancelOrder(id);
          setOrders(prev => prev.map(o => o.id === id ? updated : o));
          // Refresh products to show restored stock
          const updatedProducts = await api.getProducts();
          setProducts(updatedProducts);
          addToast('Order cancelled successfully', 'info');
      } catch (e: any) {
          addToast(e.message || 'Failed to cancel order', 'error');
      }
  };

  const deleteOrder = async (id: string) => {
      try {
          await api.deleteOrder(id);
          setOrders(prev => prev.filter(o => o.id !== id));
          addToast('Order deleted', 'info');
      } catch (e: any) {
          addToast(e.message || 'Failed to delete order', 'error');
      }
  };

  const placeOrder = async (orderData: Omit<Order, 'id' | 'date' | 'status'>): Promise<string> => {
      try {
          const newOrder: Order = {
              ...orderData,
              id: '', 
              date: '', 
              status: 'Pending'
          };
          const createdOrder = await api.createOrder(newOrder);
          setOrders(prev => [createdOrder, ...prev]);
          clearCart();
          
          const updatedProducts = await api.getProducts();
          setProducts(updatedProducts);

          return createdOrder.id;
      } catch (e: any) {
          addToast(e.message || 'Failed to place order', 'error');
          throw e;
      }
  };

  // --- Wishlist Actions ---
  const toggleWishlist = (productId: string) => {
      setWishlist(prev => {
          if (prev.includes(productId)) {
              addToast('Removed from wishlist', 'info');
              return prev.filter(id => id !== productId);
          } else {
              addToast('Added to wishlist', 'success');
              return [...prev, productId];
          }
      });
  };

  // --- Settings Actions ---
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
      try {
          const updated = await api.updateSettings(newSettings);
          setSettings(updated);
          addToast('Global settings updated', 'success');
      } catch (e: any) {
          addToast(e.message || 'Failed to update settings', 'error');
      }
  };

  // --- Cart Actions ---
  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.stock === 0) {
        addToast('This product is out of stock', 'error');
        return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      
      if (existing) {
          if (existing.quantity + quantity > product.stock) {
              addToast(`Cannot add more. Only ${product.stock} items in stock.`, 'error');
              return prev;
          }
          addToast(`${quantity > 1 ? quantity + ' x ' : ''}${product.name} updated in cart`, 'success', 2000);
          return prev.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
          );
      }
      
      if (quantity > product.stock) {
           addToast(`Cannot add more. Only ${product.stock} items in stock.`, 'error');
           return prev;
      }

      addToast(`${quantity > 1 ? quantity + ' x ' : ''}${product.name} added to cart`, 'success', 2000);
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
    addToast('Item removed from cart', 'info', 2000);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (quantity > product.stock) {
        addToast(`Max stock reached (${product.stock})`, 'warning');
        return;
    }

    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // --- Auth & User Actions ---
  const login = async (email: string, password: string): Promise<boolean> => {
      try {
          const user = await api.login(email, password);
          setUser(user);
          addToast(`Welcome back, ${user.name}`, 'success');
          
          if (user.isVerified === false) {
              addToast("Please check your email to verify your account.", "warning", 6000);
          }

          return user.role === 'admin';
      } catch (e: any) {
          console.error("Login failed", e);
          addToast(e.message || 'Login failed', 'error');
          return false;
      }
  };

  const forgotPassword = async (email: string): Promise<string | null> => {
      try {
          await api.forgotPassword(email);
          addToast('Reset link sent to your email', 'success', 8000);
          return 'ok';
      } catch (e: any) {
          addToast(e.message || 'User not found', 'error');
          return null;
      }
  };

  const openResetModal = (token: string) => {
      setIncomingResetToken(token);
      setIsAuthModalOpen(true);
  };

  const resetPassword = async (token: string, password: string): Promise<boolean> => {
      try {
          await api.resetPassword(token, password);
          addToast('Password reset successfully. Please login.', 'success');
          setIncomingResetToken(null);
          return true;
      } catch (e: any) {
          addToast(e.message || 'Failed to reset password', 'error');
          return false;
      }
  };

  const verifyEmail = useCallback(async (token: string): Promise<boolean> => {
      try {
          const response = await api.verifyEmail(token);
          if (response.user) {
              setUser(response.user);
          }
          addToast('Email verified successfully!', 'success');
          return true;
      } catch (e: any) {
          console.warn("Verification failed (likely duplicate):", e.message);
          return false;
      }
  }, [addToast]);

  const resendVerificationEmail = async () => {
      try {
          await api.resendVerification();
          addToast('Verification email sent! Check your inbox.', 'success');
      } catch (e: any) {
          addToast(e.message || 'Failed to send email', 'error');
      }
  };

  const registerUser = async (name: string, email: string, password: string): Promise<boolean> => {
      try {
          const response = await api.createUser({ name, email, password });
          addToast('Account created! Please check your email to verify.', 'success', 8000);
          return true;
      } catch (e: any) {
          addToast(e.message || 'Registration failed', 'error');
          return false;
      }
  };

  const logout = () => {
    setUser(null);
    setIsCartOpen(false);
    addToast('Logged out successfully', 'info');
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (user) {
        try {
            const updated = await api.updateUser(user.id, data);
            setUser(updated);
            addToast('Profile updated', 'success');
        } catch (e: any) {
            addToast(e.message || 'Failed to update profile', 'error');
        }
    }
  };

  const addAddress = async (address: Omit<Address, 'id'>): Promise<Address | undefined> => {
    if (user) {
        const newAddress = { ...address, id: Date.now().toString() };
        const updatedUser = { ...user, addresses: [...user.addresses, newAddress] };
        try {
            const result = await api.updateUser(user.id, { addresses: updatedUser.addresses });
            setUser(result);
            addToast('Address added successfully', 'success');
            return newAddress;
        } catch (e: any) {
            addToast(e.message || 'Failed to add address', 'error');
        }
    }
    return undefined;
  };

  const editAddress = async (id: string, updatedAddress: Omit<Address, 'id'>) => {
    if (user) {
      const updatedUser = {
        ...user,
        addresses: user.addresses.map(addr => addr.id === id ? { ...updatedAddress, id } : addr)
      };
      try {
        const result = await api.updateUser(user.id, { addresses: updatedUser.addresses });
        setUser(result);
        addToast('Address updated', 'success');
      } catch (e: any) {
          addToast(e.message || 'Failed to update address', 'error');
      }
    }
  };

  const removeAddress = async (id: string) => {
    if (user) {
        const updatedUser = { ...user, addresses: user.addresses.filter(a => a.id !== id) };
        try {
            const result = await api.updateUser(user.id, { addresses: updatedUser.addresses });
            setUser(result);
            addToast('Address removed', 'info');
        } catch (e: any) {
            addToast(e.message || 'Failed to remove address', 'error');
        }
    }
  };

  const blockUser = async (id: string) => {
      try {
          await api.updateUser(id, { status: 'Blocked' });
          setAllUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'Blocked' } : u));
          addToast('User blocked', 'warning');
      } catch (e: any) {
          addToast(e.message || 'Failed to block user', 'error');
      }
  };
  
  const unblockUser = async (id: string) => {
      try {
          await api.updateUser(id, { status: 'Active' });
          setAllUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'Active' } : u));
          addToast('User unblocked', 'success');
      } catch (e: any) {
          addToast(e.message || 'Failed to unblock user', 'error');
      }
  };

  return (
    <StoreContext.Provider
      value={{
        isLoading,
        isError,
        retryConnection,
        refreshStore,
        products,
        vendors,
        addVendor,
        updateVendor,
        deleteVendor,
        addProduct,
        deleteProduct,
        updateProduct,
        addProductReview,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        user,
        allUsers,
        refreshUsers,
        login,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerificationEmail,
        registerUser,
        logout,
        updateUserProfile,
        addAddress,
        editAddress,
        removeAddress,
        blockUser,
        unblockUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        incomingResetToken,
        openResetModal,
        orders,
        updateOrderStatus,
        deleteOrder,
        cancelOrder,
        placeOrder,
        wishlist,
        toggleWishlist,
        settings,
        updateSettings,
        quickViewProduct,
        setQuickViewProduct
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
*/













import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { CartItem, Product, User, Address, Order, OrderStatus, AppSettings, Review, Vendor } from '../types';
import { useToast } from './ToastContext';
import { api } from '../services/api';

interface StoreContextType {
  isLoading: boolean;
  isError: boolean;
  retryConnection: () => Promise<void>;
  refreshStore: () => Promise<void>;
  products: Product[];
  vendors: Vendor[];
  addVendor: (vendor: Omit<Vendor, 'id'>) => Promise<void>;
  updateVendor: (id: string, data: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviews' | 'reviewsList'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  addProductReview: (productId: string, review: Omit<Review, 'id' | 'date'>) => Promise<void>;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  user: User | null;
  allUsers: User[];
  refreshUsers: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<string | null>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
  resendVerificationEmail: () => Promise<void>;
  registerUser: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<Address | undefined>;
  editAddress: (id: string, updatedAddress: Omit<Address, 'id'>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  blockUser: (id: string) => Promise<void>;
  unblockUser: (id: string) => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (isOpen: boolean) => void;
  incomingResetToken: string | null;
  openResetModal: (token: string) => void;
  orders: Order[];
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
  placeOrder: (orderData: Omit<Order, 'id' | 'date' | 'status'>) => Promise<string>;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const initialized = useRef(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('FM_CART');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('FM_WISHLIST');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('FM_SESSION_USER');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [incomingResetToken, setIncomingResetToken] = useState<string | null>(null);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
      shippingCost: 1500,
      freeShippingThreshold: 50000,
      taxRate: 0,
      siteName: 'Farmers Market',
      supportEmail: 'support@farmersmarket.com',
      contactPhone: '+234 800 000 0000'
  });
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    localStorage.setItem('FM_CART', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('FM_WISHLIST', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (user) {
        localStorage.setItem('FM_SESSION_USER', JSON.stringify(user));
    } else {
        localStorage.removeItem('FM_SESSION_USER');
    }
  }, [user]);

  const fetchPublicData = async () => {
      try {
          setIsError(false);
          const [fetchedProducts, fetchedVendors, fetchedSettings] = await Promise.all([
              api.getProducts(),
              api.getVendors(),
              api.getSettings()
          ]);
          setProducts(fetchedProducts);
          setVendors(fetchedVendors);
          setSettings(fetchedSettings);
      } catch (e) {
          console.error("Failed to load public data", e);
          setIsError(true);
      }
  };

  const fetchUserData = async () => {
      if (!user) {
          setOrders([]);
          setAllUsers([]);
          return;
      }
      try {
          const promises: Promise<any>[] = [api.getOrders()];
          if (user.role === 'admin') {
              promises.push(api.getUsers());
          }
          
          const results = await Promise.allSettled(promises);
          
          if (results[0].status === 'fulfilled') setOrders(results[0].value);
          if (user.role === 'admin' && results[1] && results[1].status === 'fulfilled') {
              setAllUsers(results[1].value);
          }
      } catch (e) {
          console.error("Failed to load user data", e);
      }
  };

  const init = async () => {
      if (initialized.current) return;
      initialized.current = true;
      
      setIsLoading(true);
      await fetchPublicData();
      if (user) {
        await fetchUserData();
      }
      setIsLoading(false);
  };

  useEffect(() => {
      init();
  }, []);

  // Use this for manual refresh only
  const refreshStore = async () => {
      await fetchPublicData();
      if (user) await fetchUserData();
  };

  const retryConnection = async () => {
      initialized.current = false;
      await init();
  }

  const refreshUsers = useCallback(async () => {
      if (user && user.role === 'admin') {
          try {
              const users = await api.getUsers();
              setAllUsers(users);
          } catch (e) {
              console.error("Failed to refresh users", e);
          }
      }
  }, [user]);

  const addVendor = async (vendorData: Omit<Vendor, 'id'>) => {
      try {
          const newVendor = await api.addVendor(vendorData);
          setVendors(prev => [newVendor, ...prev]);
          addToast('Vendor added successfully', 'success');
      } catch (e: any) {
          addToast(e.message || 'Failed to add vendor', 'error');
      }
  };

  const updateVendor = async (id: string, data: Partial<Vendor>) => {
      try {
          const updated = await api.updateVendor(id, data);
          setVendors(prev => prev.map(v => v.id === id ? updated : v));
          addToast('Vendor updated successfully', 'success');
      } catch (e: any) {
          addToast(e.message || 'Failed to update vendor', 'error');
      }
  };

  const deleteVendor = async (id: string) => {
      try {
          await api.deleteVendor(id);
          setVendors(prev => prev.filter(v => v.id !== id));
          addToast('Vendor deleted', 'info');
      } catch (e: any) {
          addToast(e.message || 'Failed to delete vendor', 'error');
      }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'rating' | 'reviews' | 'reviewsList'>) => {
    try {
        const newProduct = await api.addProduct(productData);
        setProducts(prev => [newProduct, ...prev]);
        addToast('Product added successfully', 'success');
    } catch (e: any) {
        addToast(e.message || 'Failed to add product', 'error');
    }
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
      try {
        const updated = await api.updateProduct(id, data);
        setProducts(prev => prev.map(p => p.id === id ? updated : p));
        if (!data.reviewsList && !data.stock) { 
           addToast('Product updated successfully', 'success');
        }
      } catch (e: any) {
        addToast(e.message || 'Failed to update product', 'error');
      }
  };

  // Fixed addProductReview to correctly map over products to update the specific product in state
  const addProductReview = async (productId: string, review: Omit<Review, 'id' | 'date'>) => {
    try {
        const updatedProduct = await api.addReview(productId, review);
        // Fix: Use map to update state correctly, identifying the updated product by its id
        setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
        addToast('Review submitted successfully', 'success');
    } catch (e: any) {
        addToast(e.message || 'Failed to submit review', 'error');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
        await api.deleteProduct(id);
        setProducts(prev => prev.filter(p => p.id !== id));
        removeFromCart(id);
        addToast('Product deleted', 'info');
    } catch (e: any) {
        addToast(e.message || 'Failed to delete product', 'error');
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
      try {
          const updated = await api.updateOrderStatus(id, status);
          setOrders(prev => prev.map(o => o.id === id ? updated : o));
          addToast(`Order marked as ${status}`, 'success');
      } catch (e: any) {
          addToast(e.message || 'Failed to update order status', 'error');
      }
  };

  const cancelOrder = async (id: string) => {
      try {
          const updated = await api.cancelOrder(id);
          setOrders(prev => prev.map(o => o.id === id ? updated : o));
          const updatedProducts = await api.getProducts();
          setProducts(updatedProducts);
          addToast('Order cancelled successfully', 'info');
      } catch (e: any) {
          addToast(e.message || 'Failed to cancel order', 'error');
      }
  };

  const deleteOrder = async (id: string) => {
      try {
          await api.deleteOrder(id);
          setOrders(prev => prev.filter(o => o.id !== id));
          addToast('Order deleted', 'info');
      } catch (e: any) {
          addToast(e.message || 'Failed to delete order', 'error');
      }
  };

  const placeOrder = async (orderData: Omit<Order, 'id' | 'date' | 'status'>): Promise<string> => {
      try {
          const newOrder: Order = {
              ...orderData,
              id: '', 
              date: '', 
              status: 'Pending'
          };
          const createdOrder = await api.createOrder(newOrder);
          setOrders(prev => [createdOrder, ...prev]);
          clearCart();
          const updatedProducts = await api.getProducts();
          setProducts(updatedProducts);
          return createdOrder.id;
      } catch (e: any) {
          addToast(e.message || 'Failed to place order', 'error');
          throw e;
      }
  };

  const toggleWishlist = (productId: string) => {
      setWishlist(prev => {
          if (prev.includes(productId)) {
              addToast('Removed from wishlist', 'info');
              return prev.filter(id => id !== productId);
          } else {
              addToast('Added to wishlist', 'success');
              return [...prev, productId];
          }
      });
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
      try {
          const updated = await api.updateSettings(newSettings);
          setSettings(updated);
          addToast('Global settings updated', 'success');
      } catch (e: any) {
          addToast(e.message || 'Failed to update settings', 'error');
      }
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.stock === 0) {
        addToast('This product is out of stock', 'error');
        return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
          if (existing.quantity + quantity > product.stock) {
              addToast(`Only ${product.stock} in stock.`, 'error');
              return prev;
          }
          return prev.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
          );
      }
      if (quantity > product.stock) {
           addToast(`Only ${product.stock} in stock.`, 'error');
           return prev;
      }
      addToast(`${product.name} added to cart`, 'success', 2000);
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
    addToast('Item removed from cart', 'info', 2000);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    if (quantity > product.stock) {
        addToast(`Max stock reached (${product.stock})`, 'warning');
        return;
    }
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const login = async (email: string, password: string): Promise<boolean> => {
      try {
          const user = await api.login(email, password);
          setUser(user);
          addToast(`Welcome back, ${user.name}`, 'success');
          return user.role === 'admin';
      } catch (e: any) {
          addToast(e.message || 'Login failed', 'error');
          return false;
      }
  };

  const forgotPassword = async (email: string): Promise<string | null> => {
      try {
          await api.forgotPassword(email);
          addToast('Reset link sent to your email', 'success', 8000);
          return 'ok';
      } catch (e: any) {
          addToast(e.message || 'User not found', 'error');
          return null;
      }
  };

  const openResetModal = (token: string) => {
      setIncomingResetToken(token);
      setIsAuthModalOpen(true);
  };

  const resetPassword = async (token: string, password: string): Promise<boolean> => {
      try {
          await api.resetPassword(token, password);
          addToast('Password reset successfully.', 'success');
          setIncomingResetToken(null);
          return true;
      } catch (e: any) {
          addToast(e.message || 'Failed to reset password', 'error');
          return false;
      }
  };

  const verifyEmail = useCallback(async (token: string): Promise<boolean> => {
      try {
          const response = await api.verifyEmail(token);
          if (response.user) setUser(response.user);
          addToast('Email verified!', 'success');
          return true;
      } catch (e: any) {
          return false;
      }
  }, [addToast]);

  const resendVerificationEmail = async () => {
      try {
          await api.resendVerification();
          addToast('Verification email sent!', 'success');
      } catch (e: any) {
          addToast('Failed to send email', 'error');
      }
  };

  const registerUser = async (name: string, email: string, password: string): Promise<boolean> => {
      try {
          await api.createUser({ name, email, password });
          addToast('Account created! Please check your email.', 'success', 8000);
          return true;
      } catch (e: any) {
          addToast('Registration failed', 'error');
          return false;
      }
  };

  const logout = () => {
    setUser(null);
    setIsCartOpen(false);
    addToast('Logged out', 'info');
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (user) {
        try {
            const updated = await api.updateUser(user.id, data);
            setUser(updated);
            addToast('Profile updated', 'success');
        } catch (e: any) {
            addToast('Failed to update profile', 'error');
        }
    }
  };

  const addAddress = async (address: Omit<Address, 'id'>): Promise<Address | undefined> => {
    if (user) {
        const newAddress = { ...address, id: Date.now().toString() };
        const updatedUser = { ...user, addresses: [...user.addresses, newAddress] };
        try {
            const result = await api.updateUser(user.id, { addresses: updatedUser.addresses });
            setUser(result);
            addToast('Address added', 'success');
            return newAddress;
        } catch (e: any) {
            addToast('Failed to add address', 'error');
        }
    }
    return undefined;
  };

  const editAddress = async (id: string, updatedAddress: Omit<Address, 'id'>) => {
    if (user) {
      const updatedAddresses = user.addresses.map(addr => addr.id === id ? { ...updatedAddress, id } : addr);
      try {
        const result = await api.updateUser(user.id, { addresses: updatedAddresses });
        setUser(result);
        addToast('Address updated', 'success');
      } catch (e: any) {
          addToast('Failed to update address', 'error');
      }
    }
  };

  const removeAddress = async (id: string) => {
    if (user) {
        const updatedAddresses = user.addresses.filter(a => a.id !== id);
        try {
            const result = await api.updateUser(user.id, { addresses: updatedAddresses });
            setUser(result);
            addToast('Address removed', 'info');
        } catch (e: any) {
            addToast('Failed to remove address', 'error');
        }
    }
  };

  const blockUser = async (id: string) => {
      try {
          await api.updateUser(id, { status: 'Blocked' });
          setAllUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'Blocked' } : u));
          addToast('User blocked', 'warning');
      } catch (e: any) {
          addToast('Failed to block user', 'error');
      }
  };
  
  const unblockUser = async (id: string) => {
      try {
          await api.updateUser(id, { status: 'Active' });
          setAllUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'Active' } : u));
          addToast('User unblocked', 'success');
      } catch (e: any) {
          addToast('Failed to unblock user', 'error');
      }
  };

  return (
    <StoreContext.Provider
      value={{
        isLoading,
        isError,
        retryConnection,
        refreshStore,
        products,
        vendors,
        addVendor,
        updateVendor,
        deleteVendor,
        addProduct,
        deleteProduct,
        updateProduct,
        addProductReview,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        user,
        allUsers,
        refreshUsers,
        login,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerificationEmail,
        registerUser,
        logout,
        updateUserProfile,
        addAddress,
        editAddress,
        removeAddress,
        blockUser,
        unblockUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        incomingResetToken,
        openResetModal,
        orders,
        updateOrderStatus,
        deleteOrder,
        cancelOrder,
        placeOrder,
        wishlist,
        toggleWishlist,
        settings,
        updateSettings,
        quickViewProduct,
        setQuickViewProduct
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};





