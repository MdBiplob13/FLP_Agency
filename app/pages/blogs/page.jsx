'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  motion,
  animate,
  useInView,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
  AnimatePresence,
} from 'framer-motion';
import {
  FiArrowRight,
  FiArrowUpRight,
  FiClock,
  FiUser,
  FiSearch,
  FiTrendingUp,
  FiMail,
  FiBookOpen,
} from 'react-icons/fi';
import Footer from '../../components/footer/page.jsx';
import Navbar from '@/app/components/navbar/page.jsx';
import useBlogs from '@/hooks/blog/blogHook';

const FALLBACK_IMG = '/image1.jpg';

function formatDate(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

const readLabel = (m) => `${m || 1} min read`;

/* ------------------------------------------------------------------ */
/*  Helpers (shared design language with the home page)               */
/* ------------------------------------------------------------------ */

const easeOut = [0.22, 1, 0.36, 1];

function Reveal({ children, delay = 0, y = 36, className = '' }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: easeOut }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ to, suffix = '', duration = 1.8 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setVal(to);
      return;
    }
    const controls = animate(0, to, { duration, ease: 'easeOut', onUpdate: (v) => setVal(v) });
    return () => controls.stop();
  }, [inView, to, duration, reduce]);

  return (
    <span ref={ref}>
      {Math.round(val).toLocaleString()}
      {suffix}
    </span>
  );
}

// Card that emits a soft glow following the cursor
function SpotlightCard({ children, className = '', glow = 'rgba(99,102,241,0.18)' }) {
  const ref = useRef(null);
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const [hover, setHover] = useState(false);
  const reduce = useReducedMotion();

  function handleMove(e) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  }

  const background = useMotionTemplate`radial-gradient(240px circle at ${mx}px ${my}px, ${glow}, transparent 60%)`;

  return (
    <div
      ref={ref}
      onMouseMove={reduce ? undefined : handleMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`relative overflow-hidden ${className}`}
    >
      {!reduce && (
        <motion.div aria-hidden style={{ background }} animate={{ opacity: hover ? 1 : 0 }} transition={{ duration: 0.25 }} className="pointer-events-none absolute inset-0" />
      )}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

// Button that gently leans toward the cursor
function MagneticButton({ children, className = '', as = 'a', ...props }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 18 });
  const sy = useSpring(y, { stiffness: 250, damping: 18 });
  const reduce = useReducedMotion();
  const Comp = motion[as];

  function handleMove(e) {
    if (reduce) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - (r.left + r.width / 2)) * 0.3);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.3);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <Comp ref={ref} onMouseMove={handleMove} onMouseLeave={reset} style={{ x: sx, y: sy }} whileTap={{ scale: 0.96 }} className={className} {...props}>
      {children}
    </Comp>
  );
}

// Element that tilts in 3D toward the cursor (same feel as the home banner)
function Tilt3D({ children, className = '', max = 14 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 18 });
  const sry = useSpring(ry, { stiffness: 150, damping: 18 });

  function handleMove(e) {
    if (reduce) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * max);
    rx.set(py * -max);
  }
  function reset() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      className={`[transform-style:preserve-3d] ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function BlogsPage() {
  const reduce = useReducedMotion();

  /* ---- Real blog data (published only, featured first) ---- */
  const { blogs, blogsLoading } = useBlogs({ limit: 100 });

  // The hero highlights the featured post (or the newest as a fallback). The
  // grid below lists every published post — including the featured one — so a
  // post is never hidden just because it's the highlight.
  const featured = useMemo(
    () => blogs.find((b) => b.isFeatured) || blogs[0] || null,
    [blogs],
  );

  // Category pills are derived from the posts that actually exist.
  const categories = useMemo(() => {
    const set = new Set(blogs.map((b) => b.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [blogs]);

  // Sidebar "popular reads" — most-viewed posts.
  const popular = useMemo(
    () => [...blogs].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3),
    [blogs],
  );

  const stats = useMemo(() => {
    const reads = blogs.reduce((sum, b) => sum + (b.views || 0), 0);
    return [
      { to: blogs.length, suffix: '', label: 'Published posts' },
      { to: reads, suffix: '', label: 'Total reads' },
    ];
  }, [blogs]);

  /* ---- Hero mouse spotlight + parallax ---- */
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

  function handleHeroMove(e) {
    if (reduce || !heroRef.current) return;
    const r = heroRef.current.getBoundingClientRect();
    spotX.set(e.clientX - r.left);
    spotY.set(e.clientY - r.top);
    offX.set((e.clientX - r.left) / r.width - 0.5);
    offY.set((e.clientY - r.top) / r.height - 0.5);
  }
  function handleHeroLeave() {
    offX.set(0);
    offY.set(0);
  }

  const heroSpotlight = useMotionTemplate`radial-gradient(550px circle at ${sSpotX}px ${sSpotY}px, rgba(99,102,241,0.16), transparent 65%)`;

  /* ---- Category + search filtering ---- */
  const [activeCat, setActiveCat] = useState('All');
  const [query, setQuery] = useState('');
  const filtered = blogs.filter(
    (a) =>
      (activeCat === 'All' || a.category === activeCat) &&
      a.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="bg-[#020205] font-sans text-slate-100 antialiased">
      <Navbar />

      {/* ============================ HERO ============================ */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMove}
        onMouseLeave={handleHeroLeave}
        className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(79,70,229,0.22),transparent_40%),radial-gradient(circle_at_85%_25%,rgba(168,85,247,0.18),transparent_42%)]" />
        <div className="absolute inset-0 bg-linear-to-b from-[#020205]/0 via-[#020205]/40 to-[#020205]" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:56px_56px]" />
        {!reduce && <motion.div aria-hidden style={{ background: heroSpotlight }} className="pointer-events-none absolute inset-0" />}
        <motion.div aria-hidden style={{ x: orb1X, y: orb1Y }} className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-blue-600/20 blur-[100px]" />
        <motion.div aria-hidden style={{ x: orb2X, y: orb2Y }} className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-purple-600/20 blur-[110px]" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-6 xl:grid-cols-[1.05fr_0.95fr]">
          {/* copy */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: easeOut }} className="space-y-8">
            <span className="inline-flex items-center gap-3 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-200 ring-1 ring-blue-200/10">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
              </span>
              Content for future freelancers
            </span>

            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl xl:text-7xl">
              Stories & playbooks to{' '}
              <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">help you grow faster.</span>
            </h1>

            <p className="max-w-xl text-lg leading-8 text-slate-300">
              Practical guides, career advice, and design systems for makers who want more clarity, confidence, and momentum.
            </p>

            <div className="grid max-w-lg gap-4 sm:grid-cols-3">
              {[
                { k: 'Latest', v: featured ? formatDate(featured.createdAt) : 'Stay current' },
                { k: 'Read time', v: '5 min avg' },
                { k: 'Topics', v: `${Math.max(0, categories.length - 1)} categories` },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{s.k}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{s.v}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* featured article with 3D tilt image */}
          <motion.div initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, delay: 0.15, ease: easeOut }}>
            <Tilt3D>
              <SpotlightCard className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl">
                <div className="relative overflow-hidden rounded-[1.4rem] border border-white/10">
                  <img src={featured?.coverImage || FALLBACK_IMG} alt={featured?.title || 'Featured post'} className="h-56 w-full object-cover sm:h-64" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-blue-600/90 px-3 py-1 text-xs font-semibold text-white">
                    Featured{featured?.category ? ` · ${featured.category}` : ''}
                  </span>
                </div>
                <div className="px-2 pb-2 pt-5">
                  <h2 className="text-2xl font-semibold leading-snug text-white">
                    {featured?.title || (blogsLoading ? 'Loading latest stories…' : 'No posts yet')}
                  </h2>
                  <p className="mt-3 leading-7 text-slate-400 line-clamp-3">
                    {featured?.excerpt || 'Fresh articles are on the way. Check back soon for guides, tutorials, and career stories.'}
                  </p>
                  <div className="mt-5 flex items-center justify-between text-sm text-slate-400">
                    <span className="flex items-center gap-2"><FiUser className="h-4 w-4" /> {featured?.author?.name || 'FLP Agency'}</span>
                    <span className="flex items-center gap-2"><FiClock className="h-4 w-4" /> {readLabel(featured?.readTime)}</span>
                  </div>
                  <MagneticButton
                    href={featured ? `/pages/blogs/${featured._id}` : '#articles'}
                    className="group mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25"
                  >
                    Read full story
                    <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </MagneticButton>
                </div>
              </SpotlightCard>
            </Tilt3D>
          </motion.div>
        </div>
      </section>

      {/* ============================ ARTICLES + SIDEBAR ============================ */}
      <section id="articles" className="bg-slate-950/40 py-24">
        <div className="mx-auto max-w-7xl px-6">
          {/* toolbar: heading, search, category pills */}
          <Reveal>
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Browse topics</p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Explore insightful posts</h2>
                </div>
                <label className="relative w-full max-w-sm">
                  <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search articles…"
                    className="w-full rounded-full border border-white/10 bg-slate-900/80 py-3 pl-12 pr-4 text-sm text-white outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
              </div>

              {categories.length > 1 && (
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {categories.map((cat) => {
                    const active = activeCat === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCat(cat)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                          active ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/20' : 'border border-white/10 bg-white/5 text-slate-300 hover:border-blue-500/30 hover:text-blue-200'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Reveal>

          <div className="mt-10 grid gap-10 xl:grid-cols-[1fr_320px]">
            {/* article grid */}
            <div>
              {/* loading skeletons */}
              {blogsLoading && blogs.length === 0 ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60">
                      <div className="h-44 w-full animate-pulse bg-white/5" />
                      <div className="space-y-3 p-6">
                        <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
                        <div className="h-4 w-full animate-pulse rounded bg-white/5" />
                        <div className="h-4 w-2/3 animate-pulse rounded bg-white/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <motion.div layout className="grid gap-6 sm:grid-cols-2">
                  <AnimatePresence mode="popLayout">
                    {filtered.map((article, idx) => (
                      <motion.div
                        key={article._id}
                        layout
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.4, delay: reduce ? 0 : idx * 0.04, ease: easeOut }}
                      >
                        <motion.div whileHover={reduce ? undefined : { y: -8 }} transition={{ duration: 0.3 }} className="h-full">
                          <SpotlightCard className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-950/60 shadow-xl shadow-black/20">
                            <Link href={`/pages/blogs/${article._id}`} className="relative block overflow-hidden rounded-t-3xl">
                              <img src={article.coverImage || FALLBACK_IMG} alt={article.title} className="h-44 w-full object-cover transition-transform duration-500 hover:scale-105" />
                              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                              <span className="absolute left-3 top-3 rounded-full bg-blue-600/90 px-3 py-1 text-xs font-semibold text-white">{article.category}</span>
                            </Link>
                            <div className="flex flex-1 flex-col p-6">
                              <Link href={`/pages/blogs/${article._id}`}>
                                <h3 className="text-xl font-semibold leading-snug text-white transition-colors hover:text-blue-200">{article.title}</h3>
                              </Link>
                              <p className="mt-3 flex-1 leading-7 text-slate-400 line-clamp-3">{article.excerpt}</p>
                              <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-slate-400">
                                <span className="flex items-center gap-1.5"><FiUser className="h-3.5 w-3.5" /> {article.author?.name || 'FLP Agency'}</span>
                                <span className="flex items-center gap-1.5"><FiClock className="h-3.5 w-3.5" /> {readLabel(article.readTime)}</span>
                              </div>
                              <Link href={`/pages/blogs/${article._id}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 transition-colors hover:text-blue-200">
                                Read article <FiArrowUpRight />
                              </Link>
                            </div>
                          </SpotlightCard>
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}

              {!blogsLoading && filtered.length === 0 && (
                <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-12 text-center">
                  <FiBookOpen className="mx-auto h-10 w-10 text-slate-600" />
                  <p className="mt-4 text-lg font-semibold text-white">
                    {blogs.length === 0 ? 'No posts published yet' : 'No articles found'}
                  </p>
                  <p className="mt-1 text-slate-400">
                    {blogs.length === 0 ? 'Check back soon — new stories are on the way.' : 'Try a different topic or clear your search.'}
                  </p>
                  {blogs.length > 0 && (
                    <button
                      onClick={() => {
                        setActiveCat('All');
                        setQuery('');
                      }}
                      className="mt-6 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-blue-500/40 hover:text-blue-200"
                    >
                      Reset filters
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* sidebar */}
            <aside className="space-y-6">
              {/* popular reads */}
              {popular.length > 0 && (
                <Reveal>
                  <SpotlightCard className="rounded-3xl border border-white/10 bg-slate-950/60 p-7">
                    <p className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-blue-300">
                      <FiTrendingUp className="h-4 w-4" /> Popular reads
                    </p>
                    <div className="mt-6 space-y-3">
                      {popular.map((item, i) => (
                        <Link key={item._id} href={`/pages/blogs/${item._id}`} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/40 p-4 transition-colors hover:border-blue-500/30">
                          <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-2xl font-bold text-transparent">{String(i + 1).padStart(2, '0')}</span>
                          <div>
                            <p className="text-sm font-medium leading-snug text-slate-200 line-clamp-2">{item.title}</p>
                            <p className="mt-1 text-xs text-slate-500">{(item.views || 0).toLocaleString()} reads</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </SpotlightCard>
                </Reveal>
              )}

              {/* quick stats */}
              <Reveal delay={0.05}>
                <SpotlightCard className="rounded-3xl border border-white/10 bg-slate-950/60 p-7">
                  <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Quick stats</p>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {stats.map((s) => (
                      <div key={s.label} className="rounded-2xl bg-black/40 p-5 text-center">
                        <p className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-3xl font-bold text-transparent">
                          <CountUp to={s.to} />
                          {s.suffix}
                        </p>
                        <p className="mt-2 text-xs text-slate-400">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </SpotlightCard>
              </Reveal>
            </aside>
          </div>
        </div>
      </section>

      {/* ============================ FINAL CTA ============================ */}
      <section className="relative overflow-hidden py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <SpotlightCard
              glow="rgba(99,102,241,0.25)"
              className="relative rounded-[2.5rem] border border-white/10 bg-linear-to-br from-blue-600/15 via-slate-950/70 to-purple-600/15 p-10 text-center shadow-2xl shadow-black/40 sm:p-16"
            >
              <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:44px_44px]" />
              <div className="relative">
                <h2 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">Want more guides, tutorials, and course stories?</h2>
                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                  Follow the blog for weekly updates, skills guides, and actionable advice for your career in tech and design.
                </p>
                <div className="mt-10 flex justify-center">
                  <MagneticButton
                    href="#articles"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-10 py-4 text-base font-semibold text-white shadow-xl shadow-blue-600/30"
                  >
                    Browse all posts
                    <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </MagneticButton>
                </div>
              </div>
            </SpotlightCard>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
