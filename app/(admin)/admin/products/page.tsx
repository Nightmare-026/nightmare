'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  BookOpen, 
  X, 
  Search, 
  Filter, 
  Image as ImageIcon, 
  FileText, 
  ExternalLink,
  Loader2,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';

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
  thumbnailUrl: string | null;
  fileUrl: string;
  downloadsCount: number;
  category: { name: string };
  subject: { name: string } | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    subjectId: '',
    type: 'pdf' as 'pdf' | 'wallpaper',
    price: '',
    isFree: false,
    isActive: true,
    tags: '',
  });
  
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [subjects, setSubjects] = useState<{id: string, name: string, categoryId: string}[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchMetadata();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/products`, {
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

  const fetchMetadata = async () => {
    try {
      const response = await fetch(`${API_URL}/subjects`);
      const data = await response.json();
      if (data.success) {
        setSubjects(data.data);
        const uniqueCats = Array.from(new Set(data.data.map((s: any) => s.categoryId))).map(id => {
          const subject = data.data.find((s: any) => s.categoryId === id);
          return {
            id,
            name: subject?.category?.name || id.replace(/-/g, ' ').toUpperCase()
          };
        });
        setCategories(uniqueCats);
      }
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
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
        setProducts(products.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
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
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleFileUpload = async (file: File, type: 'image' | 'pdf') => {
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
      
      let thumbnailUrl = '';
      let fileUrl = '';

      if (thumbnail) {
        thumbnailUrl = await handleFileUpload(thumbnail, 'image');
      }

      if (productFile) {
        fileUrl = await handleFileUpload(productFile, 'pdf');
      } else {
        throw new Error('Product file is required');
      }

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
          previewUrl: thumbnailUrl
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        fetchProducts();
        setFormData({ title: '', description: '', categoryId: '', subjectId: '', type: 'pdf', price: '', isFree: false, isActive: true, tags: '' });
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

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Product Management</h1>
          <p className="text-slate-400">Add, edit, and manage your digital assets.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 rounded-xl text-white font-bold transition-all shadow-lg shadow-violet-600/20"
        >
          <Plus className="w-5 h-5" />
          Add New Product
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search products by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-violet-600 transition-colors"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">Product Info</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">Category</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">Type</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">Pricing</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">Analytics</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">Visibility</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-800/30 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                        {product.thumbnailUrl ? (
                          <img src={product.thumbnailUrl} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                          <div className="bg-violet-600/20 p-2 rounded-lg">
                            <BookOpen className="w-6 h-6 text-violet-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{product.title}</p>
                        <p className="text-xs text-slate-500 truncate">{product.subject?.name || 'No Subject'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-400">{product.category.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                      {product.type === 'pdf' ? (
                        <span className="flex items-center gap-1 text-blue-400 px-2 py-1 bg-blue-400/10 rounded-md">
                          <FileText className="w-3 h-3" />
                          PDF
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-fuchsia-400 px-2 py-1 bg-fuchsia-400/10 rounded-md">
                          <ImageIcon className="w-3 h-3" />
                          Wall
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {product.isFree ? (
                      <span className="text-sm font-bold text-emerald-400">FREE</span>
                    ) : (
                      <span className="text-sm font-bold text-white">₹{product.price}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <ExternalLink className="w-4 h-4 text-slate-500" />
                      {product.downloadsCount} DLs
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(product.id, product.isActive)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        product.isActive 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-500/5' 
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}
                    >
                      {product.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {product.isActive ? 'VISIBLE' : 'HIDDEN'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="py-20 text-center">
              <BookOpen className="w-16 h-16 text-slate-800 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No products found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  Add New Product
                </h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-400 ml-1">Title</label>
                      <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-violet-600 outline-none transition-colors"
                        placeholder="e.g., Mathematics Vol 1"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-semibold text-slate-400 ml-1 text-right block">Visibility Status</label>
                       <div className="flex items-center justify-end gap-3 p-2 bg-slate-800/50 rounded-xl border border-slate-700">
                          <span className={`text-xs font-bold ${formData.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {formData.isActive ? 'PUBLIC' : 'PRIVATE'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-600'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-400 ml-1">Description</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full h-32 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-violet-600 outline-none transition-colors resize-none"
                      placeholder="Enter detailed product description..."
                    />
                  </div>

                  {/* Taxonomy */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-400 ml-1">Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['pdf', 'wallpaper'] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setFormData({...formData, type: t})}
                            className={`py-3 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                              formData.type === t 
                                ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/20' 
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                          >
                            {t === 'pdf' ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                            {t.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-400 ml-1">Subject</label>
                      <select
                        required
                        value={formData.subjectId}
                        onChange={(e) => {
                          const sub = subjects.find(s => s.id === e.target.value);
                          setFormData({...formData, subjectId: e.target.value, categoryId: sub?.categoryId || ''});
                        }}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-violet-600 outline-none appearance-none"
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="p-6 bg-slate-800/30 border border-slate-800 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-white flex items-center gap-2">
                        Pricing Model
                        <span className="text-xs font-normal text-slate-500 px-2 py-0.5 bg-slate-800 rounded">REQUIRED</span>
                      </label>
                      <div className="flex items-center gap-4 bg-slate-900/50 p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, isFree: true, price: ''})}
                          className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${formData.isFree ? 'bg-violet-600 text-white shadow-inner' : 'text-slate-500 hover:text-white'}`}
                        >
                          FREE
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, isFree: false})}
                          className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${!formData.isFree ? 'bg-violet-600 text-white shadow-inner' : 'text-slate-500 hover:text-white'}`}
                        >
                          PAID
                        </button>
                      </div>
                    </div>

                    {!formData.isFree && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="relative"
                      >
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                        <input
                          type="number"
                          required={!formData.isFree}
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          className="w-full pl-8 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-violet-600 transition-colors"
                          placeholder="0.00"
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* File Uploads */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <label className="text-sm font-semibold text-slate-400 ml-1">Thumbnail Preview</label>
                       <div 
                         className="relative group h-40 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center transition-all hover:border-violet-600/50"
                         onDragOver={(e) => e.preventDefault()}
                         onDrop={(e) => {
                           e.preventDefault();
                           const file = e.dataTransfer.files[0];
                           if (file?.type.startsWith('image/')) setThumbnail(file);
                         }}
                       >
                         {thumbnail ? (
                           <>
                             <img src={URL.createObjectURL(thumbnail)} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                             <button 
                               type="button"
                               onClick={() => setThumbnail(null)}
                               className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                               <X className="w-4 h-4" />
                             </button>
                           </>
                         ) : (
                           <>
                             <ImageIcon className="w-8 h-8 text-slate-600 mb-2" />
                             <p className="text-xs text-slate-500">Drop image or click to upload</p>
                             <input 
                               type="file" 
                               accept="image/*" 
                               className="absolute inset-0 opacity-0 cursor-pointer"
                               onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                               title="Upload Thumbnail"
                             />
                           </>
                         )}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-sm font-semibold text-slate-400 ml-1">Asset File ({formData.type.toUpperCase()})</label>
                       <div className={`relative group h-40 rounded-2xl flex flex-col items-center justify-center transition-all border-2 border-dashed ${productFile ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/50 border-slate-700 hover:border-emerald-500/50'}`}>
                         {productFile ? (
                           <>
                             <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2">
                               <Check className="w-6 h-6 text-emerald-400" />
                             </div>
                             <p className="text-xs font-bold text-emerald-400 truncate max-w-[80%]">{productFile.name}</p>
                             <button 
                               type="button"
                               onClick={() => setProductFile(null)}
                               className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                               <X className="w-4 h-4" />
                             </button>
                           </>
                         ) : (
                           <>
                             <FileText className="w-8 h-8 text-slate-600 mb-2" />
                             <p className="text-xs text-slate-500">Click to upload {formData.type.toUpperCase()}</p>
                             <input 
                               type="file" 
                               required 
                               accept={formData.type === 'pdf' ? '.pdf' : '.png,.jpg,.jpeg,.webp'} 
                               className="absolute inset-0 opacity-0 cursor-pointer"
                               onChange={(e) => setProductFile(e.target.files?.[0] || null)}
                               title="Upload Asset"
                             />
                           </>
                         )}
                       </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-400 ml-1">Tags (separated by commas)</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-violet-600 outline-none transition-colors"
                      placeholder="e.g., math, competitive, notes"
                    />
                  </div>
                </form>
              </div>

              <div className="p-8 border-t border-slate-800 bg-slate-800/30 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-4 text-slate-400 font-bold hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  form="product-form"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 rounded-2xl text-white font-bold text-lg transition-all shadow-xl shadow-violet-600/30 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 text-white" />
                      Publish Asset
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
