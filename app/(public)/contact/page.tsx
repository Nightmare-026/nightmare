'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Send, Loader2, CheckCircle } from 'lucide-react';

// Instagram SVG icon component (defined before use)
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="18" cy="6" r="1" fill="currentColor" />
    </svg>
  );
}

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'ganeshsharma@gmail.com',
    href: 'mailto:ganeshsharma@gmail.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: 'Demo phone number',
    href: 'tel:+910000000000',
  },
  {
    icon: InstagramIcon,
    label: 'Instagram',
    value: '@nightmare-ff-026',
    href: 'https://instagram.com/nightmare-ff-026',
  },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });

    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
            <p className="text-slate-400">
              Have questions or feedback? We would love to hear from you.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <h2 className="text-2xl font-semibold text-white mb-6">Send a Message</h2>

              {isSubmitted && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <p className="text-emerald-400">Message sent successfully!</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 rounded-lg text-white font-semibold transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">Get in Touch</h2>
              <p className="text-slate-400 mb-8">
                We are here to help and answer any questions you might have.
                We look forward to hearing from you.
              </p>
            </div>

            <div className="space-y-4">
              {contactInfo.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-violet-500/50 transition-colors group"
                >
                  <div className="w-12 h-12 bg-violet-600/20 rounded-xl flex items-center justify-center group-hover:bg-violet-600/30 transition-colors">
                    <item.icon className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="text-white font-medium">{item.value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* FAQ Section */}
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <h3 className="text-lg font-semibold text-white mb-4">Frequently Asked Questions</h3>
              <div className="space-y-3">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white transition-colors">
                    <span>How do I download my purchased PDFs?</span>
                    <span className="text-violet-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-slate-400">
                    After purchase, go to your dashboard and click the download button next to your order.
                  </p>
                </details>
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white transition-colors">
                    <span>Can I get a refund?</span>
                    <span className="text-violet-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-slate-400">
                    Refunds are available within 7 days of purchase if you have not downloaded the file.
                  </p>
                </details>
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white transition-colors">
                    <span>Are the resources updated regularly?</span>
                    <span className="text-violet-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-slate-400">
                    Yes, we update our resources regularly to ensure they remain relevant and accurate.
                  </p>
                </details>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
