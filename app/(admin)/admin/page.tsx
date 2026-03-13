'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  Users
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: { status: string; _count: { status: number } }[];
  recentOrders: Array<{id: string; amount: number; status: string; user: {name: string}; product: {title: string}}>;
  popularProducts: Array<{id: string; title: string; downloadsCount: number}>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: Package, color: 'from-violet-500 to-fuchsia-500' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingBag, color: 'from-emerald-500 to-teal-500' },
    { label: 'Revenue', value: `₹${(stats?.totalRevenue || 0).toFixed(2)}`, icon: DollarSign, color: 'from-orange-500 to-amber-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white">Recent Orders</h2>
        </div>
        <div className="divide-y divide-slate-800">
          {stats?.recentOrders?.length ? (
            stats.recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{order.product.title}</p>
                  <p className="text-sm text-slate-500">by {order.user.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white">₹{order.amount}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    order.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">No recent orders</div>
          )}
        </div>
      </div>

      {/* Popular Products */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white">Popular Products</h2>
        </div>
        <div className="divide-y divide-slate-800">
          {stats?.popularProducts?.length ? (
            stats.popularProducts.slice(0, 5).map((product, index) => (
              <div key={product.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-sm text-slate-400">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-white">{product.title}</p>
                    <p className="text-sm text-slate-500">{product.downloadsCount} downloads</p>
                  </div>
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
