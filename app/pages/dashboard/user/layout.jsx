'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import {
  FiBookOpen,
  FiHeart,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiHome,
  FiZap,
  FiLoader,
  FiBell,
} from 'react-icons/fi';
import useUser from '@/hooks/user/userHook';
import NotificationBell from '@/app/components/notification/NotificationBell';

const FALLBACK_AVATAR =
  'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

const NOTIFICATIONS_HREF = '/pages/dashboard/user/notifications';

const navItems = [
  { name: 'My Courses', href: '/pages/dashboard/user', icon: FiBookOpen, exact: true },
  { name: 'My Wishlist', href: '/pages/dashboard/user/wishlist', icon: FiHeart },
  { name: 'Notifications', href: NOTIFICATIONS_HREF, icon: FiBell },
  { name: 'My Profile', href: '/pages/dashboard/user/profile', icon: FiUser },
];

export default function UserLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, userLoading, setUser, setUserRefresh } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth guard — any logged-in user may access their own dashboard
  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      toast.error('Please log in to continue.');
      router.replace('/pages/auth/login');
    }
  }, [userLoading, user, router]);

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

  // Block render until we know the user is authenticated
  if (userLoading || !user) {
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
          FLP <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Learner</span>
        </span>
      </div>

      {/* Identity */}
      <div className="mx-3 mb-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
        <img
          src={user.photo || FALLBACK_AVATAR}
          alt={user.name || 'Avatar'}
          className="h-10 w-10 flex-none rounded-full object-cover ring-2 ring-blue-500/20"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_AVATAR;
          }}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{user.name || 'Learner'}</p>
          <p className="truncate text-xs text-slate-400">{user.email}</p>
        </div>
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
            FLP <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Learner</span>
          </span>
          <div className="ml-auto">
            <NotificationBell href={NOTIFICATIONS_HREF} />
          </div>
        </header>

        {/* Desktop top bar — holds the notification bell */}
        <header className="sticky top-0 z-30 hidden items-center justify-end border-b border-white/10 bg-[#020205]/80 px-8 py-3 backdrop-blur-xl lg:flex lg:px-10">
          <NotificationBell href={NOTIFICATIONS_HREF} />
        </header>

        <main className="px-5 py-8 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
