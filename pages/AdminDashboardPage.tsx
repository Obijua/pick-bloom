
import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import { DashboardCardSkeleton, Skeleton } from '../components/Skeleton';

const AdminDashboardPage: React.FC = () => {
  const { orders, allUsers, isLoading } = useStore();

  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
  const totalOrders = orders.length;
  const totalCustomers = allUsers.filter(u => u.role === 'customer').length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const chartData = useMemo(() => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const today = new Date();
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
          const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
          last6Months.push({ monthIndex: d.getMonth(), label: months[d.getMonth()], year: d.getFullYear(), revenue: 0 });
      }
      orders.forEach(order => {
          const d = new Date(order.date);
          const bucket = last6Months.find(b => b.monthIndex === d.getMonth() && b.year === d.getFullYear());
          if (bucket) bucket.revenue += order.total;
      });
      return last6Months;
  }, [orders]);

  if (isLoading) {
      return (
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <DashboardCardSkeleton />
                  <DashboardCardSkeleton />
                  <DashboardCardSkeleton />
                  <DashboardCardSkeleton />
              </div>
          </div>
      )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">₦{totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                    <DollarSign className="h-5 w-5" />
                </div>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalOrders}</h3>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <ShoppingBag className="h-5 w-5" />
                </div>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-medium text-gray-500">Avg. Order Value</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">₦{Math.round(averageOrderValue).toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <TrendingUp className="h-5 w-5" />
                </div>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-medium text-gray-500">Total Customers</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalCustomers}</h3>
                </div>
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                    <Users className="h-5 w-5" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
