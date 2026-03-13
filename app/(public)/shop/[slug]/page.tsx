'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Download, 
  ShoppingBag, 
  Star, 
  CheckCircle2, 
  ArrowLeft,
  Loader2,
  Lock,
  ExternalLink,
  Zap
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/components/AuthProvider';
import Script from 'next/script';

const API_URL = '/api';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: 'pdf' | 'wallpaper';
  price: number | null;
  isFree: boolean;
  thumbnailUrl: string | null;
  fileUrl: string;
  category: { name: string; slug: string };
  subject?: { name: string; slug: string };
  downloadsCount: number;
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`${API_URL}/products/slug/${slug}`);
      const data = await res.json();
      if (data.success) {
        setProduct(data.data);
        if (user) {
          checkPurchaseStatus(data.data.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPurchaseStatus = async (productId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const purchased = data.data.some((o: any) => o.product.id === productId && o.status === 'paid');
        setHasPurchased(purchased);
      }
    } catch (error) {
      console.error('Failed to check purchase status:', error);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsPurchasing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId: product?.id })
      });
      const data = await res.json();

      if (data.success) {
        if (product?.isFree || data.data.order.amount === 0) {
          setHasPurchased(true);
          alert('Success! You can now download this resource.');
        } else {
          // Trigger Razorpay
          const options = {
            key: data.data.razorpayKeyId,
            amount: Math.round(data.data.order.amount * 100),
            currency: 'INR',
            name: 'Nightmare',
            description: `Purchase ${product?.title}`,
            order_id: data.data.order.razorpayOrderId,
            handler: async (response: any) => {
              const verifyRes = await fetch(`${API_URL}/orders/verify-payment`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                  orderId: data.data.order.razorpayOrderId,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                })
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                setHasPurchased(true);
                alert('Payment successful!');
              }
            },
            prefill: {
              name: user.name,
              email: user.email
            },
            theme: { color: '#7c3aed' }
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        }
      } else {
        alert(data.error || 'Failed to initiate purchase');
      }
    } catch (error: any) {
      alert('An error occurred during purchase');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleDownload = () => {
    if (product?.isFree || hasPurchased) {
      window.open(product?.fileUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Product Not Found</h1>
        <button onClick={() => router.push('/shop')} className="text-violet-400 hover:text-violet-300">
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <main className="min-h-screen pt-24 pb-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Product Media */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="aspect-[4/3] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group">
                {product.thumbnailUrl ? (
                  <img
                    src={product.thumbnailUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-20 h-20 text-slate-700" />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-violet-600/20 text-violet-400 rounded-full text-xs font-bold uppercase tracking-wider">
                  {product.category.name}
                </span>
                {product.isFree && (
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
                    Free Resource
                  </span>
                )}
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                {product.title}
              </h1>

              <div className="flex items-center gap-6 mb-8 py-4 border-y border-slate-800/50">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-white font-medium">4.8</span>
                  <span className="text-slate-500 text-sm">(Verified)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-slate-400" />
                  <span className="text-white font-medium">{product.downloadsCount}</span>
                  <span className="text-slate-500 text-sm">Downloads</span>
                </div>
              </div>

              <div className="prose prose-invert max-w-none mb-10">
                <p className="text-slate-400 text-lg leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Action Section */}
              <div className="mt-auto p-8 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ShoppingBag className="w-32 h-32 text-violet-500" />
                </div>
                
                <div className="relative">
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-4xl font-bold text-white">
                      {product.isFree ? 'Free' : `₹${product.price}`}
                    </span>
                    {!product.isFree && (
                      <span className="text-slate-500 line-through">₹{(product.price || 0) * 1.5}</span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {product.isFree || hasPurchased ? (
                      <button
                        onClick={handleDownload}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                      >
                        <Download className="w-6 h-6" />
                        Download Now (PDF)
                      </button>
                    ) : (
                      <button
                        onClick={handlePurchase}
                        disabled={isPurchasing}
                        className="w-full py-4 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-600/20"
                      >
                        {isPurchasing ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <>
                            <ShoppingBag className="w-6 h-6" />
                            Get Access Now
                          </>
                        )}
                      </button>
                    )}
                    
                    <p className="text-center text-sm text-slate-500 flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" />
                      Secure transaction & Instant access
                    </p>
                  </div>
                </div>
              </div>

              {/* Subject Info */}
              {product.subject && (
                <div className="mt-8 flex items-center gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-800">
                  <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-400">Subject</h4>
                    <p className="text-white font-semibold">{product.subject.name}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
            {[
              { title: 'High Quality PDF', desc: 'Clear, legible text and diagrams mapped to syllabus.', icon: CheckCircle2 },
              { title: 'Instant Access', desc: 'Download immediately after payment or for free.', icon: Zap },
              { title: 'Study Anywhere', desc: 'Compatible with all devices (Phone, Tablet, PC).', icon: ExternalLink },
            ].map((f, i) => (
              <div key={i} className="p-6 bg-slate-900/30 border border-slate-800 rounded-2xl">
                <f.icon className="w-8 h-8 text-violet-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
