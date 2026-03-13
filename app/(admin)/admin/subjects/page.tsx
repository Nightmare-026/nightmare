'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, FolderOpen, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Subject {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string | null;
  isActive: boolean;
  _count?: { products: number };
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
  });

  useEffect(() => {
    fetchSubjects();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !formData.categoryId) {
      setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/subjects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setSubjects(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setShowCreateModal(false);
        setFormData({ 
          name: '', 
          categoryId: categories[0]?.id || '', 
          description: '' 
        });
        fetchSubjects();
      }
    } catch (error) {
      console.error('Failed to create subject:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/subjects/${editingSubject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setEditingSubject(null);
        setFormData({ 
          name: '', 
          categoryId: categories[0]?.id || '', 
          description: '' 
        });
        fetchSubjects();
      }
    } catch (error) {
      console.error('Failed to update subject:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/subjects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        fetchSubjects();
      }
    } catch (error) {
      console.error('Failed to delete subject:', error);
    }
  };

  const startEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      categoryId: subject.categoryId,
      description: subject.description || '',
    });
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
        <h1 className="text-3xl font-bold text-white">Subjects</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Subject
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject, index) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-600/20 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{subject.name}</h3>
                  <p className="text-sm text-slate-500">
                    {categories.find(c => c.id === subject.categoryId)?.name || 'Unknown Category'}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(subject)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Edit Subject"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(subject.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete Subject"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4 line-clamp-2">
              {subject.description || 'No description'}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                {subject._count?.products || 0} products
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                subject.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
              }`}>
                {subject.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {(showCreateModal || editingSubject) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {editingSubject ? 'Edit Subject' : 'Create Subject'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingSubject(null);
                  setFormData({ 
                    name: '', 
                    categoryId: categories[0]?.id || '', 
                    description: '' 
                  });
                }}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingSubject ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                  placeholder="e.g., Physics"
                />
              </div>

              {!editingSubject && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                    title="Select Category"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-violet-500 h-24 resize-none"
                  placeholder="Optional description..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingSubject(null);
                    setFormData({ 
                      name: '', 
                      categoryId: categories[0]?.id || '', 
                      description: '' 
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white transition-colors"
                >
                  {editingSubject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
