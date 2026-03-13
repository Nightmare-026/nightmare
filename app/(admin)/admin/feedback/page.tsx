'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Star, 
  Calendar, 
  Mail, 
  ExternalLink,
  ChevronDown,
  Filter,
  Send,
  X,
  Loader2
} from 'lucide-react';

const API_URL = '/api';

interface Feedback {
  id: string;
  sectionName: string;
  pageUrl: string;
  rating: number;
  message: string | null;
  email: string | null;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [replyingTo, setReplyingTo] = useState<Feedback | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/feedback`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setFeedback(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyingTo || !replyMessage.trim()) return;

    setIsSendingReply(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/feedback/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          feedbackId: replyingTo.id,
          replyMessage
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Reply sent successfully!');
        setReplyingTo(null);
        setReplyMessage('');
      } else {
        alert(data.error || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
      alert('An error occurred while sending the reply');
    } finally {
      setIsSendingReply(false);
    }
  };

  const filteredFeedback = feedback.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'starred') return item.rating >= 4;
    if (filter === 'critical') return item.rating <= 2;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Feedback</h1>
          <p className="text-slate-400">View and manage suggestions and ratings from site visitors.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 appearance-none focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600"
            >
              <option value="all">All Feedback</option>
              <option value="starred">High Ratings (4-5★)</option>
              <option value="critical">Critical (1-2★)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredFeedback.length > 0 ? (
          filteredFeedback.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-violet-600/30 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          className={`w-4 h-4 ${s <= item.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-700'}`} 
                        />
                      ))}
                    </div>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded uppercase font-semibold">
                      {item.sectionName}
                    </span>
                  </div>

                  <p className="text-white text-lg leading-relaxed italic">
                    "{item.message || 'No written feedback provided.'}"
                  </p>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                       <Mail className="w-4 h-4" />
                       {item.email || (item.user?.email) || 'Anonymous'}
                    </div>
                    <div className="flex items-center gap-2">
                       <Calendar className="w-4 h-4" />
                       {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                    <a 
                      href={item.pageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors"
                    >
                       <ExternalLink className="w-4 h-4" />
                       View Page
                    </a>
                  </div>
                </div>

                <div className="hidden md:flex flex-col items-end gap-2">
                  <button 
                    onClick={() => setReplyingTo(item)}
                    className="px-4 py-2 bg-violet-600/10 hover:bg-violet-600 text-violet-400 hover:text-white border border-violet-600/20 rounded-lg transition-all flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Reply
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
            <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">No feedback entries found matching the filter.</p>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {replyingTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-violet-400" />
                Reply to Feedback
              </h2>
              <button 
                onClick={() => setReplyingTo(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Original Message</p>
                <p className="text-slate-300 italic text-sm">"{replyingTo.message}"</p>
                <p className="mt-2 text-xs text-slate-400">— {replyingTo.email || 'Anonymous'}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Your Reply</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Enter your response here..."
                  className="w-full h-32 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-800/30 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setReplyingTo(null)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                disabled={isSendingReply}
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                disabled={isSendingReply || !replyMessage.trim()}
                className="px-6 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 rounded-lg text-white font-semibold transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSendingReply ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Reply
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
