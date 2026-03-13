'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Grid3X3, List, Loader2 } from 'lucide-react';

const API_URL = '/api';

async function apiRequest(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}${endpoint}`, options);
  return response.json();
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  _count?: { subjects: number };
}

interface Subject {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  _count?: { products: number };
}

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: 'pdf' | 'wallpaper';
  price: number | null;
  isFree: boolean;
  thumbnailUrl: string | null;
  downloadsCount: number;
  category: Category;
  subject: Subject | null;
}

const fixedCategories = [
  { name: 'Class 1-8', slug: 'class-1-8', icon: '📚', color: 'from-blue-500 to-cyan-500' },
  { name: 'Class 9-10', slug: 'class-9-10', icon: '🎓', color: 'from-violet-500 to-fuchsia-500' },
  { name: 'Polytechnic (CSE)', slug: 'polytechnic-cse', icon: '💻', color: 'from-emerald-500 to-teal-500' },
  { name: 'Polytechnic (EE)', slug: 'polytechnic-ee', icon: '⚡', color: 'from-orange-500 to-amber-500' },
];

export default function ShopContent() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category'));
  const [selectedSubject, setSelectedSubject] = useState<string | null>(searchParams.get('subject'));
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'pdf' | 'wallpaper'>('all');
  const [filterPrice, setFilterPrice] = useState<'all' | 'free' | 'paid'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (selectedCategory) {
      fetchSubjects();
    } else {
      setSubjects([]);
      setSelectedSubject(null);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedSubject, filterType, filterPrice]);

  const fetchSubjects = async () => {
    try {
      const data = await apiRequest(`/subjects/category/${selectedCategory}`);
      setSubjects(data.data || []);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedSubject) params.append('subject', selectedSubject);
      if (filterType !== 'all') params.append('type', filterType);
      if (filterPrice === 'free') params.append('isFree', 'true');

      const data = await apiRequest(`/products?${params.toString()}`);
      setProducts(data.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = (slug: string) => {
    return fixedCategories.find(c => c.slug === slug) || fixedCategories[0];
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
            Shop
          </h1>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Shop</span>
            {selectedCategory && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-violet-400">{getCategoryInfo(selectedCategory).name}</span>
              </>
            )}
            {selectedSubject && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-fuchsia-400 capitalize">{selectedSubject.replace(/-/g, ' ')}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Selection */}
        {!selectedCategory ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {fixedCategories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className="group p-6 bg-slate-800/50 border border-slate-700 rounded-2xl hover:border-violet-500/50 transition-all duration-300 hover:transform hover:scale-105 text-left"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{cat.name}</h3>
                <p className="text-slate-400 text-sm">Click to browse subjects</p>
              </button>
            ))}
          </motion.div>
        ) : !selectedSubject ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
              >
                ← Back to Categories
              </button>
              <h2 className="text-xl font-semibold text-white">
                {getCategoryInfo(selectedCategory).name} - Select Subject
              </h2>
            </div>

            {subjects.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No subjects available in this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {subjects.map((subject) => (
                  <motion.button
                    key={subject.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setSelectedSubject(subject.slug)}
                    className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-violet-500/50 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center mb-3 group-hover:bg-violet-600/20 transition-colors">
                      <BookOpen className="w-5 h-5 text-slate-400 group-hover:text-violet-400" />
                    </div>
                    <h3 className="font-medium text-white">{subject.name}</h3>
                    <p className="text-sm text-slate-500">{subject._count?.products || 0} PDFs</p>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Filters and View Toggle */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ← Back to Subjects
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Type Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'pdf' | 'wallpaper')}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                  title="Filter by type"
                >
                  <option value="all">All Types</option>
                  <option value="pdf">PDFs Only</option>
                  <option value="wallpaper">Wallpapers Only</option>
                </select>

                {/* Price Filter */}
                <select
                  value={filterPrice}
                  onChange={(e) => setFilterPrice(e.target.value as 'all' | 'free' | 'paid')}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                  title="Filter by price"
                >
                  <option value="all">All Prices</option>
                  <option value="free">Free Only</option>
                  <option value="paid">Paid Only</option>
                </select>

                {/* View Mode */}
                <div className="flex items-center bg-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-violet-600 text-white' : 'text-slate-400'}`}
                    title="Grid View"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'text-slate-400'}`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
                <p className="text-slate-400">Try adjusting your filters</p>
              </div>
            ) : (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode={viewMode} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, viewMode }: { product: Product; viewMode: 'grid' | 'list' }) {
  return (
    <Link href={`/shop/${product.slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`group bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-violet-500/50 transition-all ${
          viewMode === 'list' ? 'flex' : ''
        }`}
      >
        <div className={`${viewMode === 'list' ? 'w-48' : 'w-full aspect-video'} bg-slate-700 relative overflow-hidden`}>
          {product.thumbnailUrl ? (
            <img
              src={product.thumbnailUrl}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-slate-600" />
            </div>
          )}
          {product.isFree && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-emerald-500/90 rounded text-xs font-medium text-white">
              FREE
            </div>
          )}
          <div className="absolute top-3 right-3 px-2 py-1 bg-slate-900/80 rounded text-xs text-slate-300 uppercase">
            {product.type}
          </div>
        </div>

        <div className="p-4 flex-1">
          <h3 className="font-semibold text-white mb-1 group-hover:text-violet-400 transition-colors">
            {product.title}
          </h3>
          <p className="text-slate-400 text-sm line-clamp-2 mb-3">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-violet-400 font-semibold">
              {product.isFree ? 'Free' : `₹${product.price}`}
            </span>
            <span className="text-slate-500 text-sm">
              {product.downloadsCount} downloads
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
