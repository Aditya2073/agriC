import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ShoppingBag, Package, CreditCard } from 'lucide-react';
import { Header } from '../components/Header';
import { NavigationBar } from '../components/NavigationBar';
import { AvailableProducts } from '../components/AvailableProducts';
import { OrderHistory } from '../components/OrderHistory';
import { supabase } from '../lib/supabase';
import { Order } from '../types';
import { CubeIcon, CurrencyRupeeIcon, InboxIcon } from '@heroicons/react/24/solid';
import { ProfileModal } from '../components/ProfileModal';

interface StatsCardProps {
  title: string;
  value: string;
  subtext?: string;
  icon: React.ReactNode;
  className?: string;
  valueClassName?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtext,
  icon,
  className = '',
  valueClassName = ''
}) => (
  <div className={`p-6 rounded-lg shadow ${className}`}>
    <div className="flex items-center">
      <div className="p-2 rounded-lg">{icon}</div>
      <div className="ml-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="flex items-baseline">
          <p className={`text-2xl font-semibold ${valueClassName || 'text-gray-900'}`}>
            {value}
          </p>
          {subtext && (
            <p className="ml-2 text-sm text-gray-500">{subtext}</p>
          )}
        </div>
      </div>
    </div>
  </div>
);

export const BuyerDashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('buyer_id', user?.id);

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total_price, 0);

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
            <p className="text-gray-600">Browse and purchase fresh produce</p>
          </div>
          <div className="flex items-center space-x-4 relative z-50">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              Profile
            </button>
            <button
              onClick={() => navigate('/logout')}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Pending Orders"
            value={pendingOrders.toString()}
            icon={<InboxIcon className="w-6 h-6 text-blue-600" />}
            className="bg-blue-50"
          />
          <StatsCard
            title="Total Orders"
            value={totalOrders.toString()}
            icon={<CubeIcon className="w-6 h-6 text-green-600" />}
            className="bg-green-50"
          />
          <StatsCard
            title="Total Spent"
            value={`₹${totalSpent}`}
            icon={<CurrencyRupeeIcon className="w-6 h-6 text-purple-600" />}
            className="bg-purple-50"
          />
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Navigate to="products" replace />} />
              <Route path="products" element={<AvailableProducts user={user} />} />
              <Route path="orders" element={<OrderHistory orders={orders} />} />
            </Routes>
          </div>
        </div>
      </div>
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </div>
  );
};