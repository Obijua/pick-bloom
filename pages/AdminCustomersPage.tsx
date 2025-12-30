
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, Mail, Phone, Calendar, Shield, Ban, CheckCircle, RefreshCcw, Users } from 'lucide-react';
import { TableRowSkeleton } from '../components/Skeleton';
import { useToast } from '../context/ToastContext';

const AdminCustomersPage: React.FC = () => {
  const { allUsers, orders, blockUser, unblockUser, isLoading, refreshUsers, user, refreshStore } = useStore();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-polling
  useEffect(() => {
      const interval = setInterval(() => {
          refreshStore();
      }, 10000); 
      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      // Force refresh on mount to ensure we see all users, including new signups
      // This is crucial if the context state is stale
      if (user?.role === 'admin') {
          handleRefresh();
      }
  }, [user]);

  const handleRefresh = async () => {
      setIsRefreshing(true);
      try {
          await refreshUsers();
      } catch (error) {
          addToast("Failed to refresh customer list", "error");
      } finally {
          setIsRefreshing(false);
      }
  };

  // Filter only 'customer' role
  const customers = allUsers.filter(u => u.role === 'customer');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to get stats per customer
  const getCustomerStats = (customerId: string) => {
      const customerOrders = orders.filter(o => o.customerId === customerId);
      const totalSpend = customerOrders.reduce((sum, o) => sum + o.total, 0);
      return { count: customerOrders.length, spend: totalSpend };
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
              <button 
                onClick={handleRefresh}
                className={`p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                title="Refresh list"
              >
                  <RefreshCcw className="h-5 w-5" />
              </button>
          </div>
          
          <div className="relative w-full sm:w-64">
              <input 
                  type="text" 
                  placeholder="Search customers..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
                      <tr>
                          <th className="px-6 py-4">Customer</th>
                          <th className="px-6 py-4">Contact</th>
                          <th className="px-6 py-4">Joined</th>
                          <th className="px-6 py-4">Orders</th>
                          <th className="px-6 py-4">Total Spend</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {isRefreshing || (isLoading && allUsers.length === 0) ? (
                           Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
                      ) : filteredCustomers.length > 0 ? (
                          filteredCustomers.map(customer => {
                              const stats = getCustomerStats(customer.id);
                              return (
                                  <tr key={customer.id} className="hover:bg-gray-50">
                                      <td className="px-6 py-4">
                                          <div className="flex items-center gap-3">
                                              <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                                                  <img src={customer.photoUrl} alt="" className="h-full w-full object-cover" />
                                              </div>
                                              <div>
                                                  <div className="font-medium text-gray-900">{customer.name}</div>
                                                  <div className="text-xs text-gray-500">ID: {customer.id}</div>
                                              </div>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <div className="flex flex-col gap-1 text-xs text-gray-600">
                                              <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {customer.email}</span>
                                              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {customer.phone}</span>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 text-gray-600">
                                          <div className="flex items-center gap-1 text-xs">
                                              <Calendar className="h-3 w-3" /> {customer.joinDate}
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 font-medium text-gray-900">{stats.count}</td>
                                      <td className="px-6 py-4 font-medium text-primary-700">₦{stats.spend.toLocaleString()}</td>
                                      <td className="px-6 py-4">
                                          <div className="flex flex-col gap-1">
                                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${
                                                  customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                              }`}>
                                                  {customer.status === 'Active' ? <CheckCircle className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                                                  {customer.status}
                                              </span>
                                              {!customer.isVerified && (
                                                  <span className="text-[10px] text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full w-fit border border-orange-100">
                                                      Unverified
                                                  </span>
                                              )}
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                          {customer.status === 'Active' ? (
                                              <button 
                                                  onClick={() => blockUser(customer.id)}
                                                  className="text-red-600 hover:text-red-800 font-medium text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors border border-red-200"
                                              >
                                                  Block User
                                              </button>
                                          ) : (
                                              <button 
                                                  onClick={() => unblockUser(customer.id)}
                                                  className="text-green-600 hover:text-green-800 font-medium text-xs bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors border border-green-200"
                                              >
                                                  Unblock
                                              </button>
                                          )}
                                      </td>
                                  </tr>
                              );
                          })
                      ) : (
                          <tr>
                              <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                                  <div className="flex flex-col items-center gap-3">
                                      <Users className="h-10 w-10 text-gray-300" />
                                      <p className="font-medium text-lg">No customers found</p>
                                      <p className="text-sm">Try refreshing the list or check if users have registered.</p>
                                      <button onClick={handleRefresh} className="text-primary-600 font-bold hover:underline text-sm mt-2">
                                          {isRefreshing ? 'Refreshing...' : 'Force Refresh'}
                                      </button>
                                  </div>
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
           <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-sm text-gray-500 flex justify-between">
              <span>{isLoading ? 'Loading...' : `Showing ${filteredCustomers.length} customers`}</span>
          </div>
      </div>
    </div>
  );
};

export default AdminCustomersPage;
