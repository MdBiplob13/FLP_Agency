'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { FiMenu, FiX, FiArrowRight, FiZap, FiUser, FiLogOut, FiGrid } from 'react-icons/fi';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import useUser from '@/hooks/user/userHook';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Courses', href: '/pages/courses' },
  { name: 'Blogs', href: '/pages/blogs' },
  { name: 'Our Teachers', href: '/pages/teachers' },
  { name: 'About Us', href: '/pages/about' },
  { name: 'Contact Us', href: '/pages/contact' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const profileRef = useRef(null);

  const { user, setUser, userLoading, setUserRefresh } = useUser();

  // Solidify the bar once the user scrolls past the top
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu on navigation
  useEffect(() => {
    setIsMenuOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // Close the profile dropdown when clicking outside of it
  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const isActive = (path) => pathname === path;

  // Send admins to the admin dashboard, everyone else to the user dashboard
  const dashboardHref =
    user && ['admin', 'superadmin'].includes(user.role)
      ? '/pages/dashboard/admin'
      : '/pages/dashboard/user';

  function handleLogout() {
    // Clear the token everywhere the hook looks for it
    Cookies.remove('flp_token');
    if (typeof window !== 'undefined') localStorage.removeItem('flp_token');
    setUser(null);
    setUserRefresh((n) => n + 1);
    setProfileOpen(false);
    toast.success('Logged out successfully.');
    router.push('/');
    router.refresh();
  }

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled || isMenuOpen
          ? 'border-b border-white/10 bg-[#020205]/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/30 transition-transform group-hover:scale-105">
              <FiZap className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              FLP <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Agency</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active ? 'text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 -z-10 rounded-full border border-white/10 bg-white/5"
                    />
                  )}
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth / Profile */}
          <div className="hidden items-center gap-3 lg:flex">
            {userLoading ? (
              // Placeholder while we verify the token to avoid auth-button flicker
              <span className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
            ) : user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 pr-3 transition-colors hover:border-blue-500/40 cursor-pointer"
                  aria-label="Open profile menu"
                >
                  <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-blue-600 to-purple-600 text-white">
                    {user.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.photo} alt={user.name || 'Profile'} className="h-full w-full object-cover" />
                    ) : (
                      <FiUser className="h-4 w-4" />
                    )}
                  </span>
                  <span className="max-w-[8rem] truncate text-sm font-semibold text-white">
                    {user.name || 'Account'}
                  </span>
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className="absolute right-0 mt-3 w-60 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a12]/95 shadow-2xl shadow-black/50 backdrop-blur-xl"
                    >
                      <div className="border-b border-white/10 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                        <p className="truncate text-xs text-slate-400">{user.email}</p>
                      </div>
                      <div className="p-1.5">
                        <Link
                          href={dashboardHref}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <FiGrid className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200 cursor-pointer"
                        >
                          <FiLogOut className="h-4 w-4" />
                          Log out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/pages/auth/login" className="text-sm font-semibold text-slate-200 transition-colors hover:text-white">
                  Login
                </Link>
                <Link
                  href="/pages/auth/signup"
                  className="group inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-shadow hover:shadow-xl hover:shadow-purple-600/30"
                >
                  Sign Up
                  <FiArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition-colors hover:text-white lg:hidden"
            onClick={() => setIsMenuOpen((o) => !o)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden lg:hidden"
            >
              <div className="flex flex-col gap-1 border-t border-white/10 py-4">
                {navLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                        active ? 'bg-white/5 text-blue-300' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}

                <div className="mt-3 flex flex-col gap-3 border-t border-white/10 pt-4">
                  {userLoading ? (
                    <span className="h-12 animate-pulse rounded-full bg-white/10" />
                  ) : user ? (
                    <>
                      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-blue-600 to-purple-600 text-white">
                          {user.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.photo} alt={user.name || 'Profile'} className="h-full w-full object-cover" />
                          ) : (
                            <FiUser className="h-5 w-5" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                          <p className="truncate text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                      <Link
                        href={dashboardHref}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:border-blue-500/40 hover:text-blue-200"
                      >
                        <FiGrid className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-4 py-3 text-center text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/20"
                      >
                        <FiLogOut className="h-4 w-4" />
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/pages/auth/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-full border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:border-blue-500/40 hover:text-blue-200"
                      >
                        Login
                      </Link>
                      <Link
                        href="/pages/auth/signup"
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-blue-600/25"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
