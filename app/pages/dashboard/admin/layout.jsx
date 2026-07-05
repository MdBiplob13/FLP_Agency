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
  FiBell,
} from 'react-icons/fi';
import useUser from '@/hooks/user/userHook';
import NotificationBell from '@/app/components/notification/NotificationBell';

// Notifications are an admin/superadmin feature — hidden for teachers. The nav
// is built per-role from this list (see `navItems` below).
const baseNavItems = [
  { name: 'Dashboard', href: '/pages/dashboard/admin', icon: FiGrid, exact: true },
  { name: 'Users', href: '/pages/dashboard/admin/users', icon: FiUsers },
  { name: 'Courses', href: '/pages/dashboard/admin/courses', icon: FiBookOpen },
  { name: 'Categories', href: '/pages/dashboard/admin/categories', icon: FiTag },
  { name: 'Blogs', href: '/pages/dashboard/admin/blogs', icon: FiFileText },
  { name: 'Our Teachers', href: '/pages/dashboard/admin/teachers', icon: FiUserCheck },
  { name: 'My Profile', href: '/pages/dashboard/admin/profile', icon: FiUser },
];

const NOTIFICATIONS_ITEM = {
  name: 'Notifications',
  href: '/pages/dashboard/admin/notifications',
  icon: FiBell,
};

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, userLoading, setUser, setUserRefresh } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Teachers share the admin panel for now, so staff = admin/superadmin/teacher.
  const isStaff = user && ['admin', 'superadmin', 'teacher'].includes(user.role);

  // Only admins/superadmins get the notifications feed — teachers don't.
  const canSeeNotifications = user && ['admin', 'superadmin'].includes(user.role);

  // Insert the Notifications item (before My Profile) for admins only.
  const navItems = canSeeNotifications
    ? [...baseNavItems.slice(0, -1), NOTIFICATIONS_ITEM, baseNavItems[baseNavItems.length - 1]]
    : baseNavItems;

  // Auth guard — redirect once auth state resolves
  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      toast.error('Please log in to continue.');
      router.replace('/pages/auth/login');
    } else if (!isStaff) {
      toast.error('Staff access only.');
      router.replace('/');
    }
  }, [userLoading, user, isStaff, router]);

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

  // Block render until we know the user is staff
  if (userLoading || !isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text-muted">
        <FiLoader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-6 py-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-accent text-white shadow-lg shadow-primary/30">
          <FiZap className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold tracking-tight text-text">
          GHLearning <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">Admin</span>
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
                  ? 'bg-linear-to-r from-blue-600/90 to-purple-600/90 text-white shadow-lg shadow-primary/20'
                  : 'text-text-muted hover:bg-surface-muted hover:text-text'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="space-y-1 border-t border-border px-3 py-4">
        <Link
          href="/"
          className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
        >
          <FiHome className="h-4.5 w-4.5" />
          Back to site
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-danger transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <FiLogOut className="h-4.5 w-4.5" />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Desktop sidebar — fixed */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-surface backdrop-blur-xl lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-border bg-surface-elevated">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-5 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-surface-muted text-text-muted hover:text-text"
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
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-surface-muted text-text hover:text-text"
            aria-label="Open menu"
          >
            <FiMenu className="h-5 w-5" />
          </button>
          <span className="text-base font-bold text-text">
            GHLearning <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">Admin</span>
          </span>
          {canSeeNotifications && (
            <div className="ml-auto">
              <NotificationBell href={NOTIFICATIONS_ITEM.href} />
            </div>
          )}
        </header>

        {/* Desktop top bar — holds the notification bell for admins */}
        {canSeeNotifications && (
          <header className="sticky top-0 z-30 hidden items-center justify-end border-b border-border bg-background/80 px-8 py-3 backdrop-blur-xl lg:flex lg:px-10">
            <NotificationBell href={NOTIFICATIONS_ITEM.href} />
          </header>
        )}

        <main className="px-5 py-8 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
