'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Target, Heart, Award, ArrowRight } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: 'Quality First',
    description: 'Every resource is carefully curated and verified by subject matter experts to ensure accuracy and relevance.',
  },
  {
    icon: Heart,
    title: 'Student-Centric',
    description: 'We put students at the heart of everything we do, designing resources that make learning enjoyable and effective.',
  },
  {
    icon: Award,
    title: 'Affordable Access',
    description: 'Quality education should be accessible to everyone. We price our resources fairly and offer many for free.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                About <span className="text-violet-400">Nightmare</span>
              </h1>
              <p className="text-xl text-slate-400 leading-relaxed">
                Empowering students with quality educational resources since 2024.
                We believe in making learning accessible, affordable, and enjoyable for everyone.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                Nightmare was born from a simple idea: every student deserves access to quality
                educational resources regardless of their financial situation.
              </p>
              <p className="text-slate-400 leading-relaxed mb-6">
                We provide carefully curated study materials, PDF notes, and aesthetic wallpapers
                for students from Class 1-10 to Polytechnic courses. Our resources are designed
                to make learning engaging and effective.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors"
              >
                Explore Resources <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-3xl flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-white" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl"
              >
                <div className="w-12 h-12 bg-violet-600/20 rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-slate-400">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-12 bg-gradient-to-r from-violet-900/50 to-fuchsia-900/50 rounded-3xl border border-violet-700/30 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Get in Touch</h2>
            <p className="text-slate-300 mb-6 max-w-xl mx-auto">
              Have questions or suggestions? We&apos;d love to hear from you.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
