import React from 'react';
import Link from 'next/link';
import { AiFillFacebook, AiOutlineInstagram, AiFillLinkedin, AiOutlineTwitter } from 'react-icons/ai';
import { FiZap, FiMail, FiPhone, FiArrowRight } from 'react-icons/fi';

const socials = [
  { icon: AiFillFacebook, label: 'Facebook' },
  { icon: AiOutlineInstagram, label: 'Instagram' },
  { icon: AiFillLinkedin, label: 'LinkedIn' },
  { icon: AiOutlineTwitter, label: 'X' },
];

const exploreLinks = [
  { name: 'Courses', href: '/pages/courses' },
  { name: 'Blogs', href: '/pages/blogs' },
  { name: 'Our Teachers', href: '/pages/teachers' },
  { name: 'About Us', href: '/pages/about' },
];

const companyLinks = [
  { name: 'Contact Us', href: '/pages/contact' },
  { name: 'Login', href: '/pages/auth/login' },
  { name: 'Sign Up', href: '/pages/auth/signup' },
  { name: 'Terms & Privacy', href: '#' },
];

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-surface text-text-muted">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.03] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:48px_48px] text-text" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px] dark:bg-primary/20" />

      <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.8fr_1fr_1fr]">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-accent text-white shadow-lg shadow-primary/30">
                <FiZap className="h-5 w-5" />
              </span>
              <span className="text-xl font-bold tracking-tight text-text">
                GHLearning
              </span>
            </Link>

            <p className="max-w-md leading-7 text-text-muted">
              Project-led courses যা career বদলে দেয় — web development, design, marketing, freelancing। Build a real portfolio, get mentor feedback, আর industry-ready হয়ে উঠুন।
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <a href="mailto:support@flpacademy.com" className="flex items-center gap-3 rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text transition-colors hover:border-primary/30 hover:text-primary">
                <FiMail className="h-4 w-4 text-primary" />
                support@flpacademy.com
              </a>
              <a href="tel:+15551234567" className="flex items-center gap-3 rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text transition-colors hover:border-primary/30 hover:text-primary">
                <FiPhone className="h-4 w-4 text-primary" />
                +1 (555) 123-4567
              </a>
            </div>

            <div className="flex items-center gap-3">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href="#"
                    aria-label={s.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-elevated text-lg text-text-muted ring-1 ring-border transition-colors hover:text-primary hover:ring-primary/40"
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-text-subtle">Explore</h4>
            <ul className="space-y-3 text-sm">
              {exploreLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="group inline-flex items-center gap-1.5 text-text-muted transition-colors hover:text-primary">
                    <FiArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-text-subtle">Company</h4>
            <ul className="space-y-3 text-sm">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="group inline-flex items-center gap-1.5 text-text-muted transition-colors hover:text-primary">
                    <FiArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-8 text-sm text-text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} GHLearning. All rights reserved.</p>
          <div className="flex flex-wrap gap-5 text-text-muted">
            <a href="#" className="transition-colors hover:text-primary">Terms</a>
            <a href="#" className="transition-colors hover:text-primary">Privacy</a>
            <Link href="/pages/contact" className="transition-colors hover:text-primary">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
