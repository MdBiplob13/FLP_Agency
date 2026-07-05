'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle({ className = '', compact = false }) {
  const { theme, toggle } = useTheme();
  const reduce = useReducedMotion();
  const isDark = theme === 'dark';

  const base =
    'inline-flex cursor-pointer items-center justify-center rounded-full border border-border bg-surface-elevated text-text-muted transition-colors hover:text-text hover:border-border-strong hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';
  const size = compact ? 'h-9 w-9' : 'h-11 w-11';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`${base} ${size} ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={reduce ? false : { opacity: 0, rotate: -30, scale: 0.85 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, rotate: 30, scale: 0.85 }}
            transition={{ duration: reduce ? 0 : 0.12 }}
            className="flex"
            aria-hidden="true"
          >
            <FiSun className="h-4 w-4" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={reduce ? false : { opacity: 0, rotate: 30, scale: 0.85 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, rotate: -30, scale: 0.85 }}
            transition={{ duration: reduce ? 0 : 0.12 }}
            className="flex"
            aria-hidden="true"
          >
            <FiMoon className="h-4 w-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
