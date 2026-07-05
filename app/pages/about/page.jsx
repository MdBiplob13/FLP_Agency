'use client';

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  animate,
  useInView,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
} from 'framer-motion';
import {
  FiArrowRight,
  FiCheck,
  FiLayers,
  FiUsers,
  FiTarget,
  FiHeart,
  FiLinkedin,
  FiTwitter,
  FiGithub,
} from 'react-icons/fi';
import Footer from '../../components/footer/page.jsx';
import Navbar from '@/app/components/navbar/page.jsx';

const values = [
  { icon: FiLayers, title: 'Practical projects', desc: 'Real-world work — day one থেকেই employers কে দেখানোর মতো।' },
  { icon: FiUsers, title: 'Mentor-led', desc: 'Industry experts থেকে active, personal feedback পান।' },
  { icon: FiTarget, title: 'Career focus', desc: 'Resume, interview, portfolio — every course-এ built-in support।' },
  { icon: FiHeart, title: 'Community', desc: 'Peer network আর study groups যা আপনাকে consistent রাখে।' },
];

const differentiators = [
  'Day one থেকে project-based learning',
  'Real work-এ live mentor feedback',
  'Career, portfolio & interview support',
  'একটা supportive peer community',
];

const stats = [
  { to: 12, suffix: 'k+', label: 'Students taught' },
  { to: 24, suffix: '+', label: 'Courses offered' },
  { to: 98, suffix: '%', label: 'Satisfaction rate' },
  { display: '4.9', suffix: '/5', label: 'Average rating' },
];

const team = [
  { name: 'Amina Rahman', role: 'Head Instructor', img: '/image1.jpg' },
  { name: 'Rafi Hossain', role: 'Curriculum Lead', img: '/image1.jpg' },
  { name: 'Sara Khan', role: 'Student Success', img: '/image1.jpg' },
];

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
    <motion.div ref={ref} onMouseMove={handleMove} onMouseLeave={reset} style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }} className={`[transform-style:preserve-3d] ${className}`}>
      {children}
    </motion.div>
  );
}

function Socials({ className = 'text-text-muted' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {[FiLinkedin, FiTwitter, FiGithub].map((Icon, i) => (
        <a key={i} href="#" aria-label="Social profile" className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted ring-1 ring-border transition-colors hover:bg-primary hover:text-white">
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}

export default function About() {
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
  const heroSpotlight = useMotionTemplate`radial-gradient(550px circle at ${sSpotX}px ${sSpotY}px, rgba(99,102,241,0.14), transparent 65%)`;

  return (
    <div className="bg-background font-sans text-text antialiased">
      <Navbar />

      {/* HERO */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMove}
        onMouseLeave={handleHeroLeave}
        className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-24"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(79,70,229,0.10),transparent_45%),radial-gradient(circle_at_85%_25%,rgba(168,85,247,0.08),transparent_45%),linear-gradient(to_bottom,#ffffff,#f8fafc)] dark:bg-[radial-gradient(circle_at_15%_15%,rgba(79,70,229,0.22),transparent_40%),radial-gradient(circle_at_85%_25%,rgba(168,85,247,0.18),transparent_42%)]" />
        <div className="absolute inset-0 dark:bg-linear-to-b dark:from-transparent dark:via-background/40 dark:to-background" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:56px_56px] text-slate-400 dark:text-white" />
        {!reduce && <motion.div aria-hidden style={{ background: heroSpotlight }} className="pointer-events-none absolute inset-0" />}
        <motion.div aria-hidden style={{ x: orb1X, y: orb1Y }} className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-primary/10 blur-[100px] dark:bg-primary/20" />
        <motion.div aria-hidden style={{ x: orb2X, y: orb2Y }} className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-accent/10 blur-[110px] dark:bg-accent/20" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: easeOut }} className="space-y-8">
            <span className="inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary ring-1 ring-primary/10">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              About us
            </span>

            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-text sm:text-5xl md:text-6xl xl:text-7xl">
              Practical skills যা{' '}
              <span className="bg-linear-to-r from-primary via-primary to-accent bg-clip-text text-transparent">career launch করে।</span>
            </h1>

            <p className="max-w-xl text-lg leading-8 text-text-muted">
              Our mission — fast, focused, hands-on training তাদের জন্য যারা job-ready skills চান। প্রতিটা course-এ live mentorship, portfolio projects, আর real career support থাকে।
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <MagneticButton
                href="/pages/courses"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-primary to-accent px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary/25"
              >
                View courses
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </MagneticButton>
              <MagneticButton
                href="/pages/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border-strong bg-surface-elevated px-8 py-4 text-base font-semibold text-text backdrop-blur transition-colors hover:border-primary/40 hover:text-primary"
              >
                Contact us
              </MagneticButton>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, delay: 0.15, ease: easeOut }}>
            <Tilt3D>
              <SpotlightCard className="rounded-[2rem] border border-border bg-surface-elevated p-4 shadow-elevated backdrop-blur-xl">
                <div className="relative overflow-hidden rounded-[1.4rem] border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/image1.jpg" alt="Students learning together" className="h-72 w-full object-cover sm:h-96" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-5 left-5">
                    <p className="text-lg font-semibold text-white">Learn by building</p>
                    <p className="text-sm text-white/80">Real projects, real mentorship</p>
                  </div>
                </div>
              </SpotlightCard>
            </Tilt3D>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="pb-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <SpotlightCard className="rounded-3xl border border-border bg-surface p-7 text-center shadow-card">
                  <p className="bg-linear-to-r from-primary to-accent bg-clip-text text-4xl font-bold text-transparent">
                    {s.display ? s.display : <CountUp to={s.to} />}
                    {s.suffix}
                  </p>
                  <p className="mt-2 text-sm uppercase tracking-[0.2em] text-text-muted">{s.label}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-primary">Our approach</p>
            <h2 className="text-4xl font-bold tracking-tight text-text sm:text-5xl">Day one থেকেই learn by building</h2>
            <p className="mt-4 text-text-muted">
              আমরা curriculum design করি এমন projects-এর চারপাশে যা real product problems mirror করে। So you graduate with demonstrable work — আর confidence to ship।
            </p>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <Reveal key={v.title} delay={i * 0.06}>
                  <SpotlightCard className="group h-full rounded-3xl border border-border bg-surface p-7 shadow-card transition-colors duration-300 hover:border-primary/30">
                    <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-accent/20 text-primary ring-1 ring-border transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-7 w-7" />
                    </span>
                    <h3 className="mb-2 text-xl font-semibold text-text">{v.title}</h3>
                    <p className="leading-7 text-text-muted">{v.desc}</p>
                  </SpotlightCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* STORY / WHY US */}
      <section className="bg-surface py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
          <Reveal>
            <Tilt3D>
              <SpotlightCard className="rounded-[2rem] border border-border bg-surface-elevated p-4 shadow-elevated">
                <div className="relative overflow-hidden rounded-[1.4rem] border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/image1.jpg" alt="A mentor reviewing a student project" className="h-80 w-full object-cover lg:h-96" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                </div>
              </SpotlightCard>
            </Tilt3D>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-primary">Why students choose us</p>
            <h2 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">Lessons-এর চেয়ে বেশি — a path to getting hired</h2>
            <p className="mt-4 leading-8 text-text-muted">
              GHLearning শুরু করেছি কারণ শুধু tutorial দেখা যথেষ্ট নয়। Real growth আসে building থেকে, feedback থেকে, আর যাঁরা কাজটা করেছেন তাঁদের guidance থেকে। এই belief-ই আমাদের পড়ানোর প্রতিটা layer shape করে।
            </p>
            <ul className="mt-8 space-y-4">
              {differentiators.map((item) => (
                <li key={item} className="flex items-center gap-3 text-text">
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-success/15 text-success">
                    <FiCheck className="h-4 w-4" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* TEAM */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-primary">Meet the team</p>
            <h2 className="text-4xl font-bold tracking-tight text-text sm:text-5xl">Instructors আর support</h2>
          </Reveal>

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m, i) => (
              <Reveal key={m.name} delay={i * 0.08}>
                <motion.div whileHover={reduce ? undefined : { y: -8 }} transition={{ duration: 0.3 }} className="h-full">
                  <SpotlightCard className="flex h-full flex-col rounded-3xl border border-border bg-surface shadow-card">
                    <div className="relative overflow-hidden rounded-t-3xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.img} alt={m.name} className="h-64 w-full object-cover transition-transform duration-500 hover:scale-105" />
                      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{m.name}</h3>
                          <p className="text-sm text-white/80">{m.role}</p>
                        </div>
                        <Socials className="text-white/80" />
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <SpotlightCard
              glow="rgba(99,102,241,0.25)"
              className="relative rounded-[2.5rem] border border-border bg-linear-to-br from-primary/10 via-surface to-accent/10 p-10 text-center shadow-elevated sm:p-16"
            >
              <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:44px_44px] text-text" />
              <div className="relative">
                <h2 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-text sm:text-5xl">Real কিছু build করতে ready?</h2>
                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-text-muted">
                  একটা cohort-এ join করুন, projects build করুন, আর mentors থেকে career support পান — যারা নিজেরা এই কাজ করেছেন।
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <MagneticButton
                    href="/pages/courses"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-primary to-accent px-10 py-4 text-base font-semibold text-white shadow-xl shadow-primary/30"
                  >
                    Browse courses
                    <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </MagneticButton>
                  <MagneticButton
                    href="/pages/contact"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border-strong bg-surface-elevated px-10 py-4 text-base font-semibold text-text transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    Get in touch
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
