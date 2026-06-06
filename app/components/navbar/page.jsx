'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Courses', href: '/pages/courses' },
    { name: 'Blogs', href: '/pages/blogs' },
    { name: 'Our Teachers', href: '/pages/teachers' },
    { name: 'About Us', href: '/pages/about' },
    { name: 'Contact Us', href: '/pages/contact' },
  ];

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <nav className="bg-black/95 backdrop-blur-sm border-b border-gray-800 fixed w-full top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-500 hover:text-blue-400 transition">
            FLP Agency
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`transition duration-300 text-sm font-medium ${isActive(link.href)
                    ? 'text-blue-500 border-b-2 border-blue-500 pb-1'
                    : 'text-gray-300 hover:text-blue-500'
                  }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3 ml-4">
              <Link
                href="/pages/auth/login"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-300 ${isActive('/login')
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white'
                  }`}
              >
                Login
              </Link>
              <Link
                href="/pages/auth/signup"
                className={`px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 ${isActive('/signup') ? 'bg-blue-700' : ''
                  }`}
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-gray-300 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="lg:hidden py-4 border-t border-gray-800"
            >
              <div className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`transition py-3 text-sm font-medium rounded-lg px-3 ${isActive(link.href)
                        ? 'text-blue-500 bg-white/5'
                        : 'text-gray-300 hover:text-blue-500 hover:bg-white/5'
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}

                {/* Mobile Auth Buttons */}
                <div className="flex flex-col gap-3 pt-4 mt-2 border-t border-gray-800">
                  <Link
                    href="/pages/auth/login"
                    className={`text-center px-4 py-3 text-sm font-medium rounded-lg transition duration-300 ${isActive('/login')
                        ? 'bg-blue-600 text-white'
                        : 'text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white'
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/pages/auth/signup"
                    className={`text-center px-4 py-3 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 ${isActive('/signup') ? 'bg-blue-700' : ''
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
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