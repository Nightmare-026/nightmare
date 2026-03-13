'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Download, Star, Zap, ArrowRight, Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  _count: {
    products: number;
    subjects: number;
  };
}

const categoryColors: Record<string, string> = {
  'class-1-8': 'from-blue-500 to-cyan-500',
  'class-9-10': 'from-violet-500 to-fuchsia-500',
  'polytechnic-cse': 'from-emerald-500 to-teal-500',
  'polytechnic-ee': 'from-orange-500 to-amber-500',
};

const defaultColor = 'from-slate-500 to-slate-600';

const features = [
  {
    icon: Download,
    title: 'Instant Downloads',
    description: 'Get your study materials immediately after purchase',
  },
  {
    icon: Star,
    title: 'Premium Quality',
    description: 'Carefully curated content by subject experts',
  },
  {
    icon: Zap,
    title: 'Affordable Prices',
    description: 'Quality education should not break the bank',
  },
];

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (data.success) {
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-slate-950">
          <div className="absolute top-20 left-10 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl lg:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
                  Educational Resources.
                </span>
                <br />
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Digital Dreams.
                </span>
              </h1>
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                Premium study materials, PDF notes, and aesthetic wallpapers for students.
                From Class 1-10 to Polytechnic courses.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 rounded-xl text-white font-semibold transition-all transform hover:scale-105"
                >
                  <BookOpen className="w-5 h-5" />
                  Browse Resources
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-semibold transition-all border border-slate-700"
                >
                  Learn More
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Browse by Category
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Choose your class or course to find relevant study materials
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={category.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/shop?category=${category.slug}`}>
                    <div className="group relative p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl hover:border-violet-500/50 transition-all duration-300 hover:transform hover:scale-105">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${categoryColors[category.slug] || defaultColor} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                        {category.icon || '📁'}
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {category.name}
                      </h3>
                      <p className="text-slate-400 text-sm mb-4">
                        {category.description || 'Browse documents for this category'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{category._count.subjects} subjects</span>
                        <span>{category._count.products}+ PDFs</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Why Choose Nightmare?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              We are committed to providing the best learning experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-2xl flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-12 bg-gradient-to-r from-violet-900/50 to-fuchsia-900/50 rounded-3xl border border-violet-700/30 overflow-hidden"
          >
            <div className="absolute inset-0 bg-slate-950/50" />
            <div className="relative text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                Join thousands of students who trust Nightmare for their educational needs.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                Explore Resources
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
