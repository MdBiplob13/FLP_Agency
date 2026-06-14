'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import {
  FiGrid,
  FiUsers,
  FiBookOpen,
  FiFileText,
  FiUserCheck,
  FiTag,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiHome,
  FiZap,
  FiLoader,
} from 'react-icons/fi';
import useUser from '@/hooks/user/userHook';

const navItems = [
  { name: 'Dashboard', href: '/pages/dashboard/admin', icon: FiGrid, exact: true },
  { name: 'Users', href: '/pages/dashboard/admin/users', icon: FiUsers },
  { name: 'Courses', href: '/pages/dashboard/admin/courses', icon: FiBookOpen },
  { name: 'Categories', href: '/pages/dashboard/admin/categories', icon: FiTag },
  { name: 'Blogs', href: '/pages/dashboard/admin/blogs', icon: FiFileText },
  { name: 'Our Teachers', href: '/pages/dashboard/admin/teachers', icon: FiUserCheck },
  { name: 'My Profile', href: '/pages/dashboard/admin/profile', icon: FiUser },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, userLoading, setUser, setUserRefresh } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user && ['admin', 'superadmin'].includes(user.role);

  // Auth guard — redirect once auth state resolves
  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      toast.error('Please log in to continue.');
      router.replace('/pages/auth/login');
    } else if (!isAdmin) {
      toast.error('Admin access only.');
      router.replace('/');
    }
  }, [userLoading, user, isAdmin, router]);

  // Close the mobile drawer on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  function handleLogout() {
    Cookies.remove('flp_token');
    if (typeof window !== 'undefined') localStorage.removeItem('flp_token');
    setUser(null);
    setUserRefresh((n) => n + 1);
    toast.success('Logged out successfully.');
    router.push('/');
    router.refresh();
  }

  const isActive = (item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  // Block render until we know the user is an admin
  if (userLoading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020205] text-slate-300">
        <FiLoader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-6 py-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/30">
          <FiZap className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold tracking-tight text-white">
          FLP <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Admin</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                active
                  ? 'bg-linear-to-r from-blue-600/90 to-purple-600/90 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        <Link
          href="/"
          className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          <FiHome className="h-4.5 w-4.5" />
          Back to site
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
        >
          <FiLogOut className="h-4.5 w-4.5" />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020205] text-slate-100">
      {/* Desktop sidebar — fixed */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/10 bg-slate-950/60 backdrop-blur-xl lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-white/10 bg-[#0a0a12]">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-5 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/5 text-slate-300 hover:text-white"
              aria-label="Close menu"
            >
              <FiX className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-[#020205]/80 px-4 py-3 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 hover:text-white"
            aria-label="Open menu"
          >
            <FiMenu className="h-5 w-5" />
          </button>
          <span className="text-base font-bold text-white">
            FLP <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Admin</span>
          </span>
        </header>

        <main className="px-5 py-8 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
