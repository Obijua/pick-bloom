
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, Eye, Filter, CheckCircle, Truck, XCircle, Clock, Package, X, MapPin } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { TableRowSkeleton } from '../components/Skeleton';

const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, isLoading, refreshStore } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Auto-polling
  useEffect(() => {
      const interval = setInterval(() => {
          refreshStore();
      }, 10000); 
      return () => clearInterval(interval);
  }, []);

  // Filter Logic
  const filteredOrders = orders.filter(order => {
      const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: OrderStatus) => {
      switch (status) {
          case 'Confirmed': return 'bg-blue-100 text-blue-800';
          case 'Shipped': return 'bg-purple-100 text-purple-800';
          case 'Delivered': return 'bg-green-100 text-green-800';
          case 'Cancelled': return 'bg-red-100 text-red-800';
          default: return 'bg-yellow-100 text-yellow-800'; // Pending
      }
  };

  const statusOptions: OrderStatus[] = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                  <input 
                      type="text" 
                      placeholder="Search orders..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none w-full sm:w-64"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              
              <div className="relative">
                  <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none appearance-none bg-white w-full sm:w-40"
                  >
                      <option value="All">All Status</option>
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
          </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
                      <tr>
                          <th className="px-6 py-4">Order ID</th>
                          <th className="px-6 py-4">Customer</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Total</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {isLoading ? (
                          Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                      ) : filteredOrders.length > 0 ? (
                          filteredOrders.map((order) => (
                              <tr key={order.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 font-medium text-gray-900">#{order.id}</td>
                                  <td className="px-6 py-4 text-gray-600">{order.customerName}</td>
                                  <td className="px-6 py-4 text-gray-500">{order.date}</td>
                                  <td className="px-6 py-4 font-medium text-gray-900">₦{order.total.toLocaleString()}</td>
                                  <td className="px-6 py-4">
                                      <select
                                          value={order.status}
                                          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                                          className={`text-xs font-bold px-2 py-1 rounded-full border-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 cursor-pointer ${getStatusColor(order.status)}`}
                                      >
                                          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                      </select>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                      <button 
                                          onClick={() => setSelectedOrder(order)}
                                          className="text-primary-600 hover:bg-primary-50 p-2 rounded-full transition-colors"
                                          title="View Details"
                                      >
                                          <Eye className="h-4 w-4" />
                                      </button>
                                  </td>
                              </tr>
                          ))
                      ) : (
                          <tr>
                              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                  No orders found matching your criteria.
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-sm text-gray-500 flex justify-between">
              <span>{isLoading ? 'Loading...' : `Showing ${filteredOrders.length} orders`}</span>
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
                      <div className="grid grid-cols-2 gap-6">
                           <div className="bg-gray-50 p-4 rounded-lg">
                               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Customer Info</h3>
                               <p className="font-bold text-gray-900">{selectedOrder.customerName}</p>
                               <p className="text-sm text-gray-600">{selectedOrder.customerEmail || 'No email provided'}</p>
                           </div>
                           <div className="bg-gray-50 p-4 rounded-lg">
                               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Payment</h3>
                               <p className="font-bold text-gray-900">{selectedOrder.paymentMethod}</p>
                               <p className="text-sm text-gray-600">{selectedOrder.date}</p>
                           </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                               <MapPin className="h-3 w-3" /> Delivery Address
                           </h3>
                           {selectedOrder.shippingAddress ? (
                               <>
                                   <p className="font-bold text-gray-900">{selectedOrder.shippingAddress.label}</p>
                                   <p className="text-sm text-gray-600">{selectedOrder.shippingAddress.street}</p>
                                   <p className="text-sm text-gray-600">
                                       {selectedOrder.shippingAddress.lga}, {selectedOrder.shippingAddress.state}
                                   </p>
                                   <p className="text-sm text-gray-600">{selectedOrder.shippingAddress.phone}</p>
                               </>
                           ) : (
                               <p className="text-sm text-gray-500 italic">No shipping address recorded for this order.</p>
                           )}
                      </div>

                      <div>
                          <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-3">Items</h3>
                          <div className="border border-gray-100 rounded-lg divide-y divide-gray-100">
                              {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                                  <div key={idx} className="p-3 flex gap-4">
                                      <div className="h-12 w-12 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                                      </div>
                                      <div className="flex-1">
                                          <div className="flex justify-between items-start">
                                              <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                                              <span className="font-medium text-gray-900 text-sm">₦{(item.price * item.quantity).toLocaleString()}</span>
                                          </div>
                                          <p className="text-xs text-gray-500">{item.quantity} x ₦{item.price.toLocaleString()}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                          <span className="font-bold text-gray-900 text-lg">Total Amount</span>
                          <span className="font-bold text-primary-600 text-2xl">₦{selectedOrder.total.toLocaleString()}</span>
                      </div>
                  </div>
                  
                  <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        <select
                            value={selectedOrder.status}
                            onChange={(e) => {
                                updateOrderStatus(selectedOrder.id, e.target.value as OrderStatus);
                                setSelectedOrder({...selectedOrder, status: e.target.value as OrderStatus});
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                        >
                            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300 text-sm">
                            Close
                        </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
