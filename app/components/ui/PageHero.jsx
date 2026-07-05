'use client';

import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { cn } from '@/lib/cn';

/*
 * PageHero — one primitive, many variants. Each variant sets:
 *   - background composition (mesh, aurora, grid overlay, orb positions)
 *   - vertical rhythm (padding, min-height)
 *   - default content max-width
 *
 * Content is passed as children so pages own their JSX. Variants:
 *   marketing   — Homepage, immersive editorial. Full-bleed mesh + orbs, tall.
 *   search      — Courses index. Compact, centered, search-focused.
 *   detail      — Course/[id]. Detail panel with meta strip.
 *   showcase    — Teachers index. Offset composition, no split.
 *   editorial   — Blogs. Magazine cover feel, tighter type.
 *   story       — About. Storytelling, asymmetric.
 *   contact     — Contact. Friendly gradient, warm accent.
 *   minimal     — Auth. Compact, subtle mesh, no floating chips.
 *   dashboard   — Dashboard shell. Dense, productivity focused.
 */

const VARIANTS = {
  marketing: {
    padding: 'pt-24 pb-20 lg:pt-32 lg:pb-28',
    minHeight: 'min-h-[92vh]',
    maxWidth: 'max-w-7xl',
    orbs: true,
    grid: true,
    mesh: 'marketing',
  },
  search: {
    padding: 'pt-24 pb-16 lg:pt-28 lg:pb-20',
    minHeight: '',
    maxWidth: 'max-w-5xl',
    orbs: false,
    grid: true,
    mesh: 'search',
  },
  detail: {
    padding: 'pt-24 pb-12 lg:pt-28 lg:pb-16',
    minHeight: '',
    maxWidth: 'max-w-7xl',
    orbs: false,
    grid: false,
    mesh: 'detail',
  },
  showcase: {
    padding: 'pt-24 pb-20 lg:pt-28 lg:pb-24',
    minHeight: '',
    maxWidth: 'max-w-7xl',
    orbs: true,
    grid: false,
    mesh: 'showcase',
  },
  editorial: {
    padding: 'pt-24 pb-16 lg:pt-28 lg:pb-20',
    minHeight: '',
    maxWidth: 'max-w-6xl',
    orbs: false,
    grid: true,
    mesh: 'editorial',
  },
  story: {
    padding: 'pt-24 pb-20 lg:pt-28 lg:pb-24',
    minHeight: '',
    maxWidth: 'max-w-6xl',
    orbs: true,
    grid: false,
    mesh: 'story',
  },
  contact: {
    padding: 'pt-24 pb-16 lg:pt-28 lg:pb-20',
    minHeight: '',
    maxWidth: 'max-w-5xl',
    orbs: true,
    grid: false,
    mesh: 'contact',
  },
  minimal: {
    padding: 'pt-24 pb-12',
    minHeight: '',
    maxWidth: 'max-w-4xl',
    orbs: false,
    grid: false,
    mesh: 'minimal',
  },
  dashboard: {
    padding: 'pt-6 pb-6',
    minHeight: '',
    maxWidth: 'max-w-7xl',
    orbs: false,
    grid: false,
    mesh: 'dashboard',
  },
};

const MESH = {
  marketing:
    'bg-[radial-gradient(circle_at_15%_15%,rgba(79,70,229,0.10),transparent_45%),radial-gradient(circle_at_85%_25%,rgba(168,85,247,0.08),transparent_45%),radial-gradient(circle_at_50%_100%,rgba(6,182,212,0.06),transparent_45%),linear-gradient(to_bottom,#ffffff_0%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_15%_15%,rgba(79,70,229,0.22),transparent_40%),radial-gradient(circle_at_85%_25%,rgba(168,85,247,0.18),transparent_42%),radial-gradient(circle_at_50%_100%,rgba(6,182,212,0.14),transparent_45%)]',
  search:
    'bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.10),transparent_55%),linear-gradient(to_bottom,#ffffff,#f8fafc)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.22),transparent_55%)]',
  detail:
    'bg-[linear-gradient(to_bottom,#ffffff,#f8fafc)] dark:bg-[linear-gradient(to_bottom,#0b0b12,#12121c)]',
  showcase:
    'bg-[radial-gradient(circle_at_20%_20%,rgba(147,51,234,0.10),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(6,182,212,0.08),transparent_45%),linear-gradient(to_bottom,#ffffff,#f8fafc)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.20),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(6,182,212,0.16),transparent_45%)]',
  editorial:
    'bg-[linear-gradient(160deg,#ffffff_0%,#f1f5f9_100%)] dark:bg-[linear-gradient(160deg,#0b0b12_0%,#171725_100%)]',
  story:
    'bg-[radial-gradient(circle_at_10%_20%,rgba(217,119,6,0.08),transparent_45%),radial-gradient(circle_at_90%_60%,rgba(79,70,229,0.10),transparent_45%),linear-gradient(to_bottom,#ffffff,#f8fafc)] dark:bg-[radial-gradient(circle_at_10%_20%,rgba(217,119,6,0.16),transparent_45%),radial-gradient(circle_at_90%_60%,rgba(99,102,241,0.20),transparent_45%)]',
  contact:
    'bg-[radial-gradient(circle_at_20%_30%,rgba(6,182,212,0.14),transparent_45%),radial-gradient(circle_at_80%_60%,rgba(147,51,234,0.10),transparent_45%),linear-gradient(to_bottom,#ffffff,#f8fafc)] dark:bg-[radial-gradient(circle_at_20%_30%,rgba(6,182,212,0.22),transparent_45%),radial-gradient(circle_at_80%_60%,rgba(168,85,247,0.20),transparent_45%)]',
  minimal:
    'bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.08),transparent_60%),linear-gradient(to_bottom,#ffffff,#f8fafc)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.20),transparent_60%)]',
  dashboard:
    'bg-surface',
};

export default function PageHero({
  variant = 'marketing',
  className = '',
  contentClassName = '',
  parallax = true,
  children,
}) {
  const config = VARIANTS[variant] || VARIANTS.marketing;
  const reduce = useReducedMotion();
  const heroRef = useRef(null);

  const spotX = useMotionValue(0);
  const spotY = useMotionValue(0);
  const sSpotX = useSpring(spotX, { stiffness: 120, damping: 25 });
  const sSpotY = useSpring(spotY, { stiffness: 120, damping: 25 });

  const offX = useMotionValue(0);
  const offY = useMotionValue(0);
  const sOffX = useSpring(offX, { stiffness: 80, damping: 20 });
  const sOffY = useSpring(offY, { stiffness: 80, damping: 20 });

  const orb1X = useTransform(sOffX, (v) => v * 40);
  const orb1Y = useTransform(sOffY, (v) => v * 40);
  const orb2X = useTransform(sOffX, (v) => v * -34);
  const orb2Y = useTransform(sOffY, (v) => v * -34);

  function handleMove(e) {
    if (reduce || !parallax || !heroRef.current) return;
    const r = heroRef.current.getBoundingClientRect();
    spotX.set(e.clientX - r.left);
    spotY.set(e.clientY - r.top);
    offX.set((e.clientX - r.left) / r.width - 0.5);
    offY.set((e.clientY - r.top) / r.height - 0.5);
  }
  function handleLeave() {
    offX.set(0);
    offY.set(0);
  }

  const spotlight = useMotionTemplate`radial-gradient(560px circle at ${sSpotX}px ${sSpotY}px, rgba(99,102,241,0.14), transparent 65%)`;

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn(
        'relative overflow-hidden',
        config.padding,
        config.minHeight,
        className,
      )}
    >
      <div className={cn('absolute inset-0', MESH[config.mesh])} />

      {config.grid && (
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:56px_56px] text-border-strong" />
      )}

      {!reduce && parallax && (
        <motion.div
          aria-hidden
          style={{ background: spotlight }}
          className="pointer-events-none absolute inset-0"
        />
      )}

      {config.orbs && (
        <>
          <motion.div
            aria-hidden
            style={{ x: orb1X, y: orb1Y }}
            className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-primary/10 blur-[100px] dark:bg-primary/20"
          />
          <motion.div
            aria-hidden
            style={{ x: orb2X, y: orb2Y }}
            className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-accent/10 blur-[110px] dark:bg-accent/20"
          />
        </>
      )}

      <div
        className={cn(
          'relative z-10 mx-auto px-6',
          config.maxWidth,
          contentClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
