'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  Heart
} from 'lucide-react';

const API_URL = '/api';

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: { status: string; _count: { status: number } }[];
  recentOrders: Array<{id: string; amount: number; status: string; user: {name: string; email: string}; product: {title: string}}>;
  popularProducts: Array<{id: string; title: string; downloadsCount: number}>;
  totalWishlists: number;
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
    { label: 'Wishlists', value: stats?.totalWishlists || 0, icon: Heart, color: 'from-pink-500 to-rose-500' },
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-violet-600/30 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1 group-hover:text-slate-300 transition-colors uppercase tracking-wider font-semibold">{stat.label}</p>
                <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-violet-400" />
              Recent Sales
            </h2>
            <button className="text-sm text-violet-400 hover:text-violet-300 transition-colors">View All</button>
          </div>
          <div className="divide-y divide-slate-800/50">
            {stats?.recentOrders?.length ? (
              stats.recentOrders.slice(0, 8).map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-violet-400">
                      {order.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-white group-hover:text-violet-400 transition-colors">{order.product.title}</p>
                      <p className="text-sm text-slate-500">{order.user.name} • {order.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-white">₹{order.amount}</p>
                      <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Paid</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500">No recent sales found</p>
              </div>
            )}
          </div>
        </div>

        {/* Popular Products */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 bg-slate-800/30">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Top Products
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {stats?.popularProducts?.length ? (
              stats.popularProducts.slice(0, 6).map((product, index) => (
                <div key={product.id} className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-sm font-medium text-slate-200 truncate pr-4">{product.title}</p>
                    <span className="text-xs font-bold text-slate-400">{product.downloadsCount}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((product.downloadsCount / (stats.popularProducts[0].downloadsCount || 1)) * 100, 100)}%` }}
                      className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">No product data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
