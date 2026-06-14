'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  motion,
  animate,
  useInView,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
  AnimatePresence,
} from 'framer-motion';
import {
  FiCode,
  FiPenTool,
  FiTrendingUp,
  FiTarget,
  FiSmartphone,
  FiBriefcase,
  FiCheck,
  FiStar,
  FiArrowRight,
  FiPlay,
  FiAward,
  FiUsers,
  FiClock,
  FiZap,
  FiBookOpen,
  FiVideo,
  FiShield,
  FiLayers,
} from 'react-icons/fi';
import Footer from '../../components/footer/page.jsx';
import useCourses from '@/hooks/course/courseHook';

const FALLBACK_IMG = '/image1.jpg';

// Resolve a course doc into a display price ({ isFree, price, oldPrice }).
function coursePrice(c) {
  if (c.priceTier === 'free') return { isFree: true, price: 0, oldPrice: null };
  if (c.priceTier === 'discounted' && c.discountPrice) {
    return { isFree: false, price: c.discountPrice, oldPrice: c.price || null };
  }
  return { isFree: false, price: c.price || 0, oldPrice: null };
}

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */

const stats = [
  { to: 12, suffix: 'k+', label: 'Students enrolled' },
  { to: 98, suffix: '%', label: 'Completion rate' },
  { display: '4.9', suffix: '★', label: 'Average rating' },
  { to: 50, suffix: '+', label: 'Expert mentors' },
];

const categories = [
  { icon: FiCode, title: 'Web Development', desc: 'Build real websites and full-stack apps from scratch with modern tooling.' },
  { icon: FiPenTool, title: 'UI/UX Design', desc: 'Design product experiences that delight users and lift conversions.' },
  { icon: FiTrendingUp, title: 'Digital Marketing', desc: 'Master ads, funnels, SEO, and audience growth that actually sells.' },
  { icon: FiTarget, title: 'Career Coaching', desc: 'Resume reviews, interview prep, and portfolio guidance from pros.' },
  { icon: FiSmartphone, title: 'Mobile Apps', desc: 'Ship mobile-first experiences for iOS and Android with React Native.' },
  { icon: FiBriefcase, title: 'Freelancing', desc: 'Price your services, win clients, and scale a freelance business.' },
];

// "Slide in from the right" — exactly four in a line
const perks = [
  { icon: FiVideo, title: 'Project-based', desc: 'Learn by building real projects for your portfolio.' },
  { icon: FiUsers, title: 'Mentor support', desc: 'Direct feedback from working industry experts.' },
  { icon: FiAward, title: 'Certificates', desc: 'Earn shareable, recognised certificates.' },
  { icon: FiZap, title: 'Lifetime access', desc: 'Buy once and keep every future update.' },
];

// Stacking cards — the learning journey
const journey = [
  { n: '01', title: 'Pick your path', desc: 'Choose a track aligned with the career or skill you want to grow, from beginner to advanced.', accent: 'from-blue-500 to-indigo-500', icon: FiTarget, img: '/image1.jpg' },
  { n: '02', title: 'Learn by building', desc: 'Follow guided, project-driven lessons and ship real work — not just watch videos passively.', accent: 'from-indigo-500 to-purple-500', icon: FiCode, img: '/image1.jpg' },
  { n: '03', title: 'Get expert feedback', desc: 'Submit your projects and level up fast with personal reviews from mentors who do this daily.', accent: 'from-purple-500 to-pink-500', icon: FiUsers, img: '/image1.jpg' },
  { n: '04', title: 'Launch your career', desc: 'Graduate with a portfolio, a certificate, and the confidence to land the job or clients you want.', accent: 'from-cyan-500 to-blue-500', icon: FiAward, img: '/image1.jpg' },
];

const testimonials = [
  { quote: 'The web development course helped me land a job in 6 weeks. The projects were practical and the support was genuinely excellent.', name: 'Sara Ahmed', role: 'Junior Web Developer', rating: 5 },
  { quote: 'I launched my freelance design business right after the UX course. The mentor feedback was the part that actually changed my work.', name: 'Rina Paul', role: 'Freelance Designer', rating: 5 },
  { quote: 'Went from zero marketing knowledge to running paid campaigns for clients. The bootcamp paid for itself in the first month.', name: 'Imran Khan', role: 'Growth Marketer', rating: 5 },
  { quote: 'Clear, structured, and never boring. The certificate helped me stand out and the lifetime access keeps me coming back.', name: 'Lucia Gomez', role: 'Frontend Engineer', rating: 5 },
];

const marquee = ['Web Development', 'UI/UX Design', 'React', 'Next.js', 'Figma', 'Digital Marketing', 'Freelancing', 'Career Growth', 'Mobile Apps', 'Branding'];

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const easeOut = [0.22, 1, 0.36, 1];

// Scroll-reveal wrapper with optional stagger delay
function Reveal({ children, delay = 0, y = 36, className = '' }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay, ease: easeOut }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated number that counts up when scrolled into view
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

// Card that emits a soft glow following the cursor (the "mouse effect")
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
        <motion.div
          aria-hidden
          style={{ background }}
          animate={{ opacity: hover ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-none absolute inset-0"
        />
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

function Stars({ n = 5 }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-400" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar key={i} className={`h-4 w-4 ${i < n ? 'fill-amber-400' : 'opacity-30'}`} />
      ))}
    </div>
  );
}

// Sticky card that scales back slightly as the next one scrolls over it (stacking effect)
function StackCard({ index, children }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 160px', 'end 220px'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  return (
    <div ref={ref} className="sticky" style={{ top: `${130 + index * 26}px` }}>
      <motion.div style={{ scale: reduce ? 1 : scale }} className="origin-top">
        {children}
      </motion.div>
    </div>
  );
}

// Element that tilts in 3D toward the cursor (same feel as the hero card)
function Tilt3D({ children, className = '', max = 16 }) {
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

export default function Home() {
  const reduce = useReducedMotion();

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
  const cardRX = useTransform(sOffY, (v) => v * -8);
  const cardRY = useTransform(sOffX, (v) => v * 10);

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

  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroContentY = useTransform(heroScroll, [0, 1], [0, reduce ? 0 : 120]);
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, reduce ? 1 : 0]);

  /* ---- Testimonials carousel ---- */
  const [tIndex, setTIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTIndex((i) => (i + 1) % testimonials.length), 4500);
    return () => clearInterval(id);
  }, []);

  /* ---- Popular courses: 1 bestseller + the first 2 featured ---- */
  const { courses: allCourses, coursesLoading } = useCourses({ limit: 50 });
  const popularCourses = useMemo(() => {
    const bestseller = allCourses.find((c) => c.isBestseller);
    const featured = allCourses
      .filter((c) => c.isFeatured && c._id !== bestseller?._id)
      .slice(0, 2);
    const picked = [bestseller, ...featured].filter(Boolean);
    // Backfill from the rest so all three slots stay populated.
    if (picked.length < 3) {
      const used = new Set(picked.map((c) => c._id));
      for (const c of allCourses) {
        if (picked.length >= 3) break;
        if (!used.has(c._id)) {
          picked.push(c);
          used.add(c._id);
        }
      }
    }
    return picked.slice(0, 3);
  }, [allCourses]);

  return (
    <div className="bg-[#020205] text-slate-100 font-sans antialiased">
      {/* ============================ HERO / BANNER ============================ */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMove}
        onMouseLeave={handleHeroLeave}
        className="relative min-h-screen overflow-hidden pt-28 pb-24 lg:pt-36 lg:pb-32"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(79,70,229,0.22),transparent_40%),radial-gradient(circle_at_85%_25%,rgba(168,85,247,0.18),transparent_42%),radial-gradient(circle_at_50%_100%,rgba(6,182,212,0.14),transparent_45%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,2,5,0)_0%,rgba(2,2,5,0.4)_60%,#020205_100%)]" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:56px_56px]" />
        {!reduce && <motion.div aria-hidden style={{ background: heroSpotlight }} className="pointer-events-none absolute inset-0" />}
        <motion.div aria-hidden style={{ x: orb1X, y: orb1Y }} className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-blue-600/20 blur-[100px]" />
        <motion.div aria-hidden style={{ x: orb2X, y: orb2Y }} className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-purple-600/20 blur-[110px]" />

        <motion.div
          style={{ y: heroContentY, opacity: heroOpacity }}
          className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: easeOut }} className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-200 ring-1 ring-blue-200/10">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
              </span>
              New cohorts open — learn high-income skills
            </div>

            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl xl:text-7xl">
              Master skills that{' '}
              <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">actually get you paid.</span>
            </h1>

            <p className="max-w-xl text-lg leading-8 text-slate-300">
              Expert-led courses in development, design, and marketing — with hands-on projects, real mentor feedback, and the career support to
              land the job or clients you want.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <MagneticButton
                href="#courses"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-shadow hover:shadow-xl hover:shadow-purple-600/30"
              >
                Browse courses
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </MagneticButton>
              <MagneticButton
                href="#journey"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur transition-colors hover:border-blue-500/40 hover:text-blue-200"
              >
                <FiPlay className="h-4 w-4" />
                How it works
              </MagneticButton>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
              <div className="flex -space-x-3">
                {['from-blue-500 to-indigo-500', 'from-purple-500 to-pink-500', 'from-cyan-500 to-blue-500', 'from-amber-500 to-orange-500'].map((g, i) => (
                  <span key={i} className={`inline-block h-9 w-9 rounded-full bg-linear-to-br ${g} ring-2 ring-[#020205]`} />
                ))}
              </div>
              <div className="text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <Stars n={5} />
                  <span className="font-semibold text-white">4.9/5</span>
                </div>
                <span className="text-slate-400">from 12,000+ happy students</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: easeOut }}
            style={{ rotateX: cardRX, rotateY: cardRY, transformPerspective: 1000 }}
            className="relative [transform-style:preserve-3d]"
          >
            <div className="relative rounded-[2rem] border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl">
              <div className="relative overflow-hidden rounded-[1.4rem] border border-white/10">
                <img src="/image1.jpg" alt="Preview of a featured course lesson" className="h-64 w-full object-cover sm:h-72" />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                <button className="absolute inset-0 flex items-center justify-center" aria-label="Play course preview">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur ring-1 ring-white/30 transition hover:scale-105 hover:bg-white/25">
                    <FiPlay className="ml-1 h-7 w-7 text-white" />
                  </span>
                </button>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="rounded-full bg-blue-600/90 px-3 py-1 text-xs font-semibold text-white">Bestseller</span>
                  <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">38h • 142 lessons</span>
                </div>
              </div>

              <div className="px-2 pb-1 pt-4">
                <p className="text-xs uppercase tracking-[0.3em] text-blue-300">Top course</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Full-Stack Web Development</h3>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Stars n={5} />
                    <span className="text-slate-300">4.9</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">৳49</span>
                    <span className="text-sm text-slate-500 line-through">৳199</span>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              animate={reduce ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -left-6 top-10 hidden items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 shadow-xl shadow-black/40 backdrop-blur sm:flex"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                <FiAward className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Certificate</p>
                <p className="text-xs text-slate-400">on completion</p>
              </div>
            </motion.div>

            <motion.div
              animate={reduce ? undefined : { y: [0, 12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-5 bottom-12 hidden items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 shadow-xl shadow-black/40 backdrop-blur sm:flex"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                <FiUsers className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">12k+ learners</p>
                <p className="text-xs text-slate-400">enrolled this year</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ============================ MARQUEE TRUST BAR ============================ */}
      <section className="border-y border-white/5 bg-slate-950/40 py-6">
        <p className="mb-4 text-center text-xs uppercase tracking-[0.35em] text-slate-500">Skills our students master</p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <motion.div className="flex w-max gap-4" animate={reduce ? undefined : { x: ['0%', '-50%'] }} transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}>
            {[...marquee, ...marquee].map((m, i) => (
              <span key={i} className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300">
                <FiLayers className="h-4 w-4 text-blue-400" />
                {m}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================ STATS ============================ */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <SpotlightCard className="rounded-3xl border border-white/10 bg-slate-950/60 p-8 text-center">
                  <p className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
                    {s.display ? s.display : <CountUp to={s.to} />}
                    {s.suffix}
                  </p>
                  <p className="mt-3 text-sm uppercase tracking-[0.2em] text-slate-400">{s.label}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      

      {/* ============================ FEATURED COURSES ============================ */}
      <section id="courses" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-blue-300">Popular courses</p>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Courses students love</h2>
          </Reveal>

          {coursesLoading && popularCourses.length === 0 ? (
            <div className="grid gap-7 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60">
                  <div className="h-60 w-full animate-pulse bg-white/5 sm:h-64" />
                  <div className="space-y-4 p-7">
                    <div className="mx-auto h-5 w-2/3 animate-pulse rounded bg-white/10" />
                    <div className="mx-auto h-6 w-24 animate-pulse rounded bg-white/5" />
                    <div className="mx-auto h-10 w-48 animate-pulse rounded-full bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : popularCourses.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-12 text-center text-slate-400">
              No courses to show yet.
            </div>
          ) : (
            <div className="grid gap-7 md:grid-cols-3">
              {popularCourses.map((course, i) => {
                const p = coursePrice(course);
                const badge = course.isBestseller ? 'Bestseller' : course.isFeatured ? 'Featured' : null;
                return (
                  <Reveal key={course._id} delay={i * 0.08}>
                    <motion.div whileHover={reduce ? undefined : { y: -8 }} transition={{ duration: 0.3 }} className="h-full">
                      <SpotlightCard className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-950/60 text-center shadow-xl shadow-black/20">
                        <div className="relative">
                          <img src={course.thumbnail || FALLBACK_IMG} alt={course.title} className="h-60 w-full object-cover transition-transform duration-500 hover:scale-105 sm:h-64" />
                          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                          {badge && (
                            <span className="absolute left-4 top-4 rounded-full bg-blue-600/90 px-3 py-1 text-xs font-semibold text-white">{badge}</span>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col items-center p-7">
                          <h3 className="text-xl font-semibold leading-snug text-white">{course.title}</h3>
                          <div className="mt-4 flex items-baseline justify-center gap-2">
                            {p.isFree ? (
                              <span className="text-2xl font-bold text-emerald-300">Free</span>
                            ) : (
                              <>
                                <span className="text-2xl font-bold text-white">৳{p.price}</span>
                                {p.oldPrice ? <span className="text-sm text-slate-500 line-through">৳{p.oldPrice}</span> : null}
                              </>
                            )}
                          </div>
                          <div className="mt-auto flex w-full items-center justify-center gap-3 pt-6">
                            <Link
                              href={`/pages/courses/${course._id}`}
                              className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110"
                            >
                              Enrol now <FiArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/pages/courses/${course._id}`}
                              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-blue-500/40 hover:text-blue-200"
                            >
                              Details
                            </Link>
                          </div>
                        </div>
                      </SpotlightCard>
                    </motion.div>
                  </Reveal>
                );
              })}
            </div>
          )}

          {/* View all courses */}
          <Reveal className="mt-12 flex justify-center">
            <Link
              href="/pages/courses"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-4 text-base font-semibold text-white transition-colors hover:border-blue-500/40 hover:text-blue-200"
            >
              View all courses <FiArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============================ PERKS — SLIDE IN FROM THE RIGHT (4 in a line) ============================ */}
      <section className="relative overflow-hidden bg-slate-950/40 py-24">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <Reveal className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-blue-300">Why learn with us</p>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Built so you actually finish</h2>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {perks.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, x: reduce ? 0 : 120 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, delay: i * 0.12, ease: easeOut }}
                >
                  <SpotlightCard className="h-full rounded-3xl border border-white/10 bg-slate-950/60 p-7">
                    <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300 ring-1 ring-white/10">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="text-lg font-semibold text-white">{p.title}</h3>
                    <p className="mt-1.5 leading-7 text-slate-400">{p.desc}</p>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================ JOURNEY — STACKING CARDS ON SCROLL ============================ */}
      <section id="journey" className="relative py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-blue-300">Your learning journey</p>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">From signup to career, step by step</h2>
            <p className="mt-4 text-slate-400">Keep scrolling — each step stacks into place.</p>
          </Reveal>

          <div className="space-y-6">
            {journey.map((j, i) => {
              const Icon = j.icon;
              return (
                <StackCard key={j.n} index={i}>
                  <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl shadow-black/40">
                    <div className={`h-1.5 w-full bg-linear-to-r ${j.accent}`} />
                    <div className="grid items-center gap-8 p-8 sm:p-10 lg:min-h-[24rem] lg:grid-cols-2">
                      {/* content */}
                      <div>
                        <div className="flex items-center gap-5">
                          <span className={`bg-linear-to-r ${j.accent} bg-clip-text text-6xl font-bold leading-none text-transparent`}>{j.n}</span>
                          <span className={`flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-linear-to-br ${j.accent} text-white shadow-lg`}>
                            <Icon className="h-7 w-7" />
                          </span>
                        </div>
                        <h3 className="mt-6 text-2xl font-semibold text-white sm:text-3xl">{j.title}</h3>
                        <p className="mt-3 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">{j.desc}</p>
                      </div>

                      {/* 3D image (tilts toward the cursor like the banner) */}
                      <Tilt3D className="relative">
                        <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-xl shadow-black/40">
                          <img src={j.img} alt={j.title} className="h-56 w-full object-cover sm:h-64 lg:h-72" />
                          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                          <span className={`absolute left-4 top-4 rounded-full bg-linear-to-r ${j.accent} px-3 py-1 text-xs font-semibold text-white shadow-lg`}>
                            Step {j.n}
                          </span>
                        </div>
                      </Tilt3D>
                    </div>
                  </div>
                </StackCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================ TESTIMONIALS ============================ */}
      <section className="bg-slate-950/40 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal className="mb-14 text-center">
            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-blue-300">Student stories</p>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Careers changed, in their words</h2>
          </Reveal>

          <div className="relative min-h-[18rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={tIndex}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.5, ease: easeOut }}
                className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 text-center shadow-2xl shadow-black/30 sm:p-12"
              >
                <div className="mb-6 flex justify-center"><Stars n={testimonials[tIndex].rating} /></div>
                <p className="text-xl leading-relaxed text-slate-200 sm:text-2xl">“{testimonials[tIndex].quote}”</p>
                <div className="mt-8 flex items-center justify-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-500 text-lg font-bold text-white">
                    {testimonials[tIndex].name.charAt(0)}
                  </span>
                  <div className="text-left">
                    <p className="font-semibold text-white">{testimonials[tIndex].name}</p>
                    <p className="text-sm text-slate-400">{testimonials[tIndex].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex justify-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTIndex(i)}
                  aria-label={`Show testimonial ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === tIndex ? 'w-8 bg-blue-500' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>
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
                <h2 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">Start learning today. Change your career this year.</h2>
                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                  Join 12,000+ learners building real skills with expert mentorship. Your first lessons are free.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <MagneticButton
                    href="#courses"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-10 py-4 text-base font-semibold text-white shadow-xl shadow-blue-600/30"
                  >
                    Get started free
                    <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </MagneticButton>
                  <span className="flex items-center gap-2 text-sm text-slate-400">
                    <FiShield className="h-4 w-4 text-emerald-400" /> 30-day money-back guarantee
                  </span>
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
