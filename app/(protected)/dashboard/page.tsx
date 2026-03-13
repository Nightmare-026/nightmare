'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Download, Heart, Loader2, Package, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

const API_URL = '/api';

interface Order {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  product: {
    id: string;
    title: string;
    type: string;
    thumbnailUrl: string | null;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, router]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome, {user.name}</h1>
              <p className="text-slate-400">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-violet-500/20 rounded-lg">
                <Package className="w-5 h-5 text-violet-400" />
              </div>
              <span className="text-slate-400">Total Orders</span>
            </div>
            <p className="text-3xl font-bold text-white">{orders.length}</p>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Download className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-slate-400">Downloads</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {orders.filter(o => o.status === 'paid').length}
            </p>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-fuchsia-500/20 rounded-lg">
                <Heart className="w-5 h-5 text-fuchsia-400" />
              </div>
              <span className="text-slate-400">Wishlist</span>
            </div>
            <p className="text-3xl font-bold text-white">0</p>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-semibold text-white">My Orders</h2>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No orders yet</h3>
              <p className="text-slate-400 mb-4">Start shopping to see your orders here</p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 rounded-lg text-white transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                Browse Shop
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {orders.map((order) => (
                <div key={order.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center">
                      {order.product.thumbnailUrl ? (
                        <img
                          src={order.product.thumbnailUrl}
                          alt={order.product.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <BookOpen className="w-8 h-8 text-slate-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{order.product.title}</h3>
                      <p className="text-sm text-slate-500">
                        {order.product.type.toUpperCase()} • ₹{order.amount}
                      </p>
                      <p className="text-sm text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      order.status === 'paid'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : order.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {order.status}
                    </span>
                    {order.status === 'paid' && (
                      <Link
                        href={`/shop/${order.product.id}/download`}
                        className="p-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white transition-colors"
                      >
                        <Download className="w-5 h-5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
