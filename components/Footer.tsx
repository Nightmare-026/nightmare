'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Mail, Instagram, Heart, Loader2, CheckCircle } from 'lucide-react';
import { AdminLink } from './AdminLink';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const footerLinks = {
    shop: [
      { label: 'Class 1-8', href: '/shop?category=class-1-8' },
      { label: 'Class 9-10', href: '/shop?category=class-9-10' },
      { label: 'Polytechnic CSE', href: '/shop?category=polytechnic-cse' },
      { label: 'Polytechnic EE', href: '/shop?category=polytechnic-ee' },
    ],
    support: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    try {
      // Simulate/Implement subscription logic
      // In a real app, this would call /api/newsletter
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Nightmare
              </span>
            </Link>
            <p className="text-slate-400 text-sm mb-4">
              Educational Resources. Digital Dreams.
            </p>
            <div className="flex gap-3">
              <a
                href="mailto:ganeshsharna7114@gmail.com"
                className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                title="Email Us"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/nightmare-ff-026"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                title="Follow on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-violet-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-violet-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <AdminLink />
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4">Stay Updated</h3>
            <p className="text-slate-400 text-sm mb-4">
              Subscribe for new resources and exclusive offers.
            </p>
            <form className="flex gap-2" onSubmit={handleSubscribe}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className={`px-4 py-2 rounded-lg text-white text-sm transition-colors flex items-center justify-center min-w-[100px] ${
                  status === 'success' 
                    ? 'bg-emerald-600' 
                    : 'bg-violet-600 hover:bg-violet-700'
                }`}
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : status === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
            {status === 'success' && (
              <p className="text-emerald-400 text-xs mt-2 animate-fade-in">Thanks for subscribing!</p>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {currentYear} Nightmare. All rights reserved.
          </p>
          <p className="text-slate-500 text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for students
          </p>
        </div>
      </div>
    </footer>
  );
}
