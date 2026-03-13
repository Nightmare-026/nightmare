'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, BookOpen, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: 'pdf' | 'wallpaper';
  price: number | null;
  isFree: boolean;
  isActive: boolean;
  downloadsCount: number;
  category: { name: string };
  subject: { name: string } | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await response.json();
      if (data.success) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to toggle product:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Products</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800/50 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Product</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Category</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Type</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Price</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Downloads</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Status</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{product.title}</p>
                      <p className="text-sm text-slate-500">{product.subject?.name || 'No Subject'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-400">{product.category.name}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 uppercase">
                    {product.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">
                  {product.isFree ? 'Free' : `₹${product.price}`}
                </td>
                <td className="px-6 py-4 text-slate-400">{product.downloadsCount}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleActive(product.id, product.isActive)}
                    className={`px-2 py-1 rounded text-xs ${
                      product.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {product.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No products yet</h3>
            <p className="text-slate-500 mb-4">Add your first product to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 rounded-lg text-white transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>
        )}
      </div>

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    subjectId: '',
    type: 'pdf' as 'pdf' | 'wallpaper',
    price: '',
    isFree: false,
    tags: '',
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [subjects, setSubjects] = useState<{id: string, name: string, categoryId: string}[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const token = localStorage.getItem('token');
      const [catRes, subRes] = await Promise.all([
        fetch(`${API_URL}/subjects`, { headers: { Authorization: `Bearer ${token}` } }), // Reusing subjects route to get categories indirectly or just hardcode if simple
        fetch(`${API_URL}/subjects`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      // Since subjects endpoint returns nested data, we can derive unique categories
      const subData = await subRes.json();
      if (subData.success) {
        setSubjects(subData.data);
        const uniqueCats = Array.from(new Set(subData.data.map((s: any) => s.categoryId))).map(id => ({
          id,
          name: id.replace(/-/g, ' ').toUpperCase() // Basic formatting
        }));
        setCategories(uniqueCats);
      }
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
    }
  };

  const handleUpload = async (file: File, type: 'image' | 'pdf') => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append(type, file);

    const response = await fetch(`${API_URL}/upload/${type}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || `Failed to upload ${type}`);
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      // 1. Upload files first
      let thumbnailUrl = '';
      let fileUrl = '';

      if (thumbnail) {
        thumbnailUrl = await handleUpload(thumbnail, 'image');
      }

      if (productFile) {
        fileUrl = await handleUpload(productFile, 'pdf');
      } else {
        throw new Error('Product file is required');
      }

      // 2. Create product
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: formData.isFree ? 0 : parseFloat(formData.price || '0'),
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
          thumbnailUrl,
          fileUrl,
          previewUrl: thumbnailUrl // Using thumbnail as preview for now
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        fetchProducts();
        // Reset form
        setFormData({ title: '', description: '', categoryId: '', subjectId: '', type: 'pdf', price: '', isFree: false, tags: '' });
        setThumbnail(null);
        setProductFile(null);
      } else {
        alert(data.error || 'Failed to create product');
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Products</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800/50 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Product</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Category</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Type</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Price</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Downloads</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Status</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden">
                      {product.thumbnailUrl ? (
                        <img src={product.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{product.title}</p>
                      <p className="text-sm text-slate-500">{product.subject?.name || 'No Subject'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-400">{product.category.name}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 uppercase">
                    {product.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">
                  {product.isFree ? 'Free' : `₹${product.price}`}
                </td>
                <td className="px-6 py-4 text-slate-400">{product.downloadsCount}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleActive(product.id, product.isActive)}
                    className={`px-2 py-1 rounded text-xs ${
                      product.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {product.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No products yet</h3>
            <p className="text-slate-500 mb-4">Add your first product to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 rounded-lg text-white transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Add New Product</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-violet-600 transition-colors"
                    placeholder="Product title"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-violet-600"
                    title="Select Product Type"
                  >
                    <option value="pdf">PDF Resource</option>
                    <option value="wallpaper">Creative Wallpaper</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Category</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-violet-600"
                    title="Select Category"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Subject (Optional)</label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-violet-600"
                    title="Select Subject"
                  >
                    <option value="">No Subject</option>
                    {subjects.filter(s => s.categoryId === formData.categoryId).map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
                    Price
                    <span className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="isFree"
                        checked={formData.isFree}
                        onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-800 text-violet-600"
                      />
                      <label htmlFor="isFree" className="text-xs uppercase cursor-pointer">Free</label>
                    </span>
                  </label>
                  <input
                    type="number"
                    disabled={formData.isFree}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-violet-600 disabled:opacity-50 transition-all"
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-violet-600"
                    placeholder="notes, math, class-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-violet-600 h-32 resize-none"
                  placeholder="Tell users about this resource..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Thumbnail Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                    className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-600 file:text-white hover:file:bg-violet-700 cursor-pointer"
                    title="Upload Thumbnail"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Product File (PDF/ZIP)</label>
                  <input
                    type="file"
                    required
                    accept=".pdf,.zip,.rar"
                    onChange={(e) => setProductFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                    title="Upload Product File"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50 rounded-xl text-white font-bold text-lg transition-all shadow-lg shadow-violet-600/20"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading Product...
                  </span>
                ) : (
                  'Create Product'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

