
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search,
  Leaf,
  ChevronRight,
  AlertCircle,
  Clock,
  Store,
  RefreshCcw // Added Refresh Icon
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

const AdminLayout: React.FC = () => {
  const { user, logout, isLoading, orders, products, refreshStore } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading) {
        if (!user || user.role !== 'admin') {
            navigate('/');
        }
    }
  }, [user, isLoading, navigate]);

  // Close notifications on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRefresh = async () => {
      setIsRefreshing(true);
      await refreshStore();
      setIsRefreshing(false);
  };

  if (isLoading || !user || user.role !== 'admin') {
     return null; 
  }

  // Calculate Notifications
  const pendingOrders = orders.filter(o => o.status === 'Pending');
  const lowStockProducts = products.filter(p => p.stock < 5 && p.stock > 0);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  const notificationCount = pendingOrders.length + lowStockProducts.length + outOfStockProducts.length;

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: Store, label: 'Vendors', path: '/admin/vendors' }, 
    { icon: Users, label: 'Customers', path: '/admin/customers' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const pageTitle = navItems.find(item => item.path === location.pathname)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0d2610] text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
           <Link to="/" className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary-400" />
              <span className="text-xl font-bold font-serif">Farmers Market</span>
           </Link>
        </div>

        <div className="p-4">
           <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">Main Menu</div>
           <nav className="space-y-1">
              {navItems.map((item) => (
                 <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                       location.pathname === item.path 
                       ? 'bg-primary-600 text-white shadow-md' 
                       : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                 >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                 </Link>
              ))}
           </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
            <button 
                onClick={() => { logout(); navigate('/'); }}
                className="flex items-center gap-3 px-3 py-3 w-full rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
            >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
         {/* Top Header */}
         <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                    {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
                
                {/* Breadcrumbs / Page Title */}
                <div className="hidden sm:flex items-center text-sm text-gray-500">
                    <span>Admin</span>
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span className="font-bold text-gray-900">{pageTitle}</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Refresh Button */}
                <button 
                    onClick={handleRefresh}
                    className={`p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-all ${isRefreshing ? 'animate-spin bg-gray-100' : ''}`}
                    title="Refresh Data"
                >
                    <RefreshCcw className="h-5 w-5" />
                </button>

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                    <button 
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className={`p-2 rounded-full relative transition-colors ${isNotificationsOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <Bell className="h-5 w-5" />
                        {notificationCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-fade-in-up overflow-hidden">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900">Notifications</h3>
                                <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {notificationCount} New
                                </span>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notificationCount === 0 ? (
                                    <div className="p-8 text-center text-gray-500 text-sm">
                                        All caught up! No new notifications.
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-50">
                                        {pendingOrders.map(order => (
                                            <li key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                <Link to="/admin/orders" onClick={() => setIsNotificationsOpen(false)} className="flex items-start gap-3">
                                                    <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                                                        <ShoppingBag className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">New Order #{order.id}</p>
                                                        <p className="text-xs text-gray-500">From {order.customerName} - ₦{order.total.toLocaleString()}</p>
                                                        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                            <Clock className="h-3 w-3" /> {order.date}
                                                        </p>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                        {outOfStockProducts.map(product => (
                                            <li key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                <Link to="/admin/products" onClick={() => setIsNotificationsOpen(false)} className="flex items-start gap-3">
                                                    <div className="bg-red-50 p-2 rounded-full text-red-600">
                                                        <AlertCircle className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">Out of Stock</p>
                                                        <p className="text-xs text-gray-500">{product.name} is currently out of stock.</p>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                        {lowStockProducts.map(product => (
                                            <li key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                <Link to="/admin/products" onClick={() => setIsNotificationsOpen(false)} className="flex items-start gap-3">
                                                    <div className="bg-yellow-50 p-2 rounded-full text-yellow-600">
                                                        <Package className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">Low Stock Alert</p>
                                                        <p className="text-xs text-gray-500">Only {product.stock} left for {product.name}.</p>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                        <img src={user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>
         </header>

         {/* Scrollable Content Area */}
         <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
         </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
      )}
    </div>
  );
};

export default AdminLayout;
