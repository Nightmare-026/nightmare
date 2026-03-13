'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  BookOpen,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  ShoppingBag,
  Users
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/subjects', label: 'Subjects', icon: FolderOpen },
  { href: '/admin/products', label: 'Products', icon: BookOpen },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAdmin, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isLoading, isAdmin, router]);

  if (isLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 min-h-screen fixed left-0 top-0">
          <div className="p-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Admin</span>
            </Link>
          </div>

          <nav className="px-4 py-4 space-y-1">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-violet-600/20 text-violet-400 border border-violet-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
            <div className="mb-4 px-4">
              <p className="text-sm text-slate-400">Logged in as</p>
              <p className="text-white font-medium truncate">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
