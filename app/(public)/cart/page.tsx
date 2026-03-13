'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, BookOpen } from 'lucide-react';

export default function CartPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-slate-600" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3">Your cart is empty</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Looks like you haven&apos;t added any resources yet. Browse our shop to find study materials.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 rounded-xl text-white font-semibold transition-all transform hover:scale-105"
          >
            <BookOpen className="w-5 h-5" />
            Browse Shop
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
