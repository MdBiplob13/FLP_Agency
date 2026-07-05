'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { FiMenu, FiX, FiArrowRight, FiZap, FiUser, FiLogOut, FiGrid } from 'react-icons/fi';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import useUser from '@/hooks/user/userHook';
import ThemeToggle from '../theme/ThemeToggle';

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setProfileOpen(false);
  }, [pathname]);

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

  const dashboardHref =
    user && ['admin', 'superadmin'].includes(user.role)
      ? '/pages/dashboard/admin'
      : '/pages/dashboard/user';

  function handleLogout() {
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
          ? 'border-b border-border bg-background/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 ">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-accent text-white shadow-lg shadow-primary/30 transition-transform group-hover:scale-105">
              <FiZap className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold tracking-tight text-text">
              GHL Learning
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active ? 'text-text' : 'text-text-muted hover:text-text'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 -z-10 rounded-full border border-border bg-surface-muted"
                    />
                  )}
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <ThemeToggle compact />
            {userLoading ? (
              <span className="h-10 w-10 animate-pulse rounded-full bg-surface-muted" />
            ) : user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full border border-border bg-surface-elevated p-1 pr-3 transition-colors hover:border-primary/40 cursor-pointer"
                  aria-label="Open profile menu"
                >
                  <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-primary to-accent text-white">
                    {user.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.photo} alt={user.name || 'Profile'} className="h-full w-full object-cover" />
                    ) : (
                      <FiUser className="h-4 w-4" />
                    )}
                  </span>
                  <span className="max-w-[8rem] truncate text-sm font-semibold text-text">
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
                      className="absolute right-0 mt-3 w-60 overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-elevated backdrop-blur-xl"
                    >
                      <div className="border-b border-border px-4 py-3">
                        <p className="truncate text-sm font-semibold text-text">{user.name}</p>
                        <p className="truncate text-xs text-text-muted">{user.email}</p>
                      </div>
                      <div className="p-1.5">
                        <Link
                          href={dashboardHref}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-muted"
                        >
                          <FiGrid className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10 cursor-pointer"
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
                <Link href="/pages/auth/login" className="text-sm font-semibold text-text-muted transition-colors hover:text-text">
                  Login
                </Link>
                <Link
                  href="/pages/auth/signup"
                  className="group inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl hover:shadow-accent/30"
                >
                  Sign Up
                  <FiArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle compact />
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-elevated text-text-muted transition-colors hover:text-text"
              onClick={() => setIsMenuOpen((o) => !o)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden lg:hidden"
            >
              <div className="flex flex-col gap-1 border-t border-border py-4">
                {navLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                        active ? 'bg-surface-muted text-primary' : 'text-text-muted hover:bg-surface-muted hover:text-text'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}

                <div className="mt-3 flex flex-col gap-3 border-t border-border pt-4">
                  {userLoading ? (
                    <span className="h-12 animate-pulse rounded-full bg-surface-muted" />
                  ) : user ? (
                    <>
                      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-elevated px-4 py-3">
                        <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-primary to-accent text-white">
                          {user.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.photo} alt={user.name || 'Profile'} className="h-full w-full object-cover" />
                          ) : (
                            <FiUser className="h-5 w-5" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text">{user.name}</p>
                          <p className="truncate text-xs text-text-muted">{user.email}</p>
                        </div>
                      </div>
                      <Link
                        href={dashboardHref}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center gap-2 rounded-full border border-border-strong bg-surface-elevated px-4 py-3 text-center text-sm font-semibold text-text transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        <FiGrid className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 rounded-full border border-danger/20 bg-danger/10 px-4 py-3 text-center text-sm font-semibold text-danger transition-colors hover:bg-danger/20"
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
                        className="rounded-full border border-border-strong bg-surface-elevated px-4 py-3 text-center text-sm font-semibold text-text transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        Login
                      </Link>
                      <Link
                        href="/pages/auth/signup"
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-full bg-linear-to-r from-primary to-accent px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-primary/25"
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
