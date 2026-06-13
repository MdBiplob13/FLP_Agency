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
  FiArrowUpRight,
  FiStar,
  FiUsers,
  FiAward,
  FiBriefcase,
  FiCheck,
  FiMessageCircle,
  FiLinkedin,
  FiTwitter,
  FiGithub,
} from 'react-icons/fi';
import Navbar from '../../components/navbar/page.jsx';
import Footer from '../../components/footer/page.jsx';

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */

const teachers = [
  { name: 'Amina Rahman', role: 'Head Instructor', tags: ['React', 'Next.js', 'Frontend'], description: 'Builds modern web products with real teams and helps students ship portfolio-ready applications.', img: '/image1.jpg' },
  { name: 'Rafi Hossain', role: 'Curriculum Lead', tags: ['Product', 'Course design'], description: 'Crafts lessons around real product problems so every student learns skills employers want.', img: '/image1.jpg' },
  { name: 'Sara Khan', role: 'Career Coach', tags: ['Resumes', 'Interviews', 'Growth'], description: 'Guides students through interview prep, portfolio reviews, and client-ready presentations.', img: '/image1.jpg' },
  { name: 'Omar Ali', role: 'UX Mentor', tags: ['Design systems', 'Research'], description: 'Reviews UX flows, usability, and accessibility with a focus on polished digital experiences.', img: '/image1.jpg' },
  { name: 'Dia Islam', role: 'Growth Mentor', tags: ['Marketing', 'Freelance'], description: 'Teaches creators how to launch services, attract clients, and grow their brand online.', img: '/image1.jpg' },
  { name: 'Karim Noor', role: 'Backend Mentor', tags: ['Node', 'APIs', 'Databases'], description: 'Helps students design reliable services and understand how production systems really work.', img: '/image1.jpg' },
];

const stats = [
  { to: 6, suffix: '+', label: 'Expert mentors' },
  { display: '2.4', suffix: 'k+', label: 'Students guided' },
  { display: '4.9', suffix: '/5', label: 'Mentor rating' },
  { to: 40, suffix: '+', label: 'Years combined' },
];

const reasons = [
  { icon: FiMessageCircle, title: 'Live feedback', desc: 'Specific reviews on projects, interviews, and real deliverables.' },
  { icon: FiBriefcase, title: 'Career-ready advice', desc: 'Learn how to package your work, tell your story, and win clients.' },
  { icon: FiAward, title: 'Industry experience', desc: 'Mentorship from people who have shipped real products at scale.' },
  { icon: FiUsers, title: 'Small cohorts', desc: 'Focused groups make it easy to ask questions and get personal guidance.' },
];

const successStories = [
  { quote: 'The mentors helped me build a portfolio I could confidently share with clients.', name: 'Mina', role: 'Freelance Designer' },
  { quote: 'The career guidance was the difference between applying and getting hired.', name: 'Sayeed', role: 'Frontend Developer' },
];

/* ------------------------------------------------------------------ */
/*  Helpers (shared design language)                                  */
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

function Stars({ n = 5 }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-400" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar key={i} className={`h-4 w-4 ${i < n ? 'fill-amber-400' : 'opacity-30'}`} />
      ))}
    </div>
  );
}

function Socials({ className = 'text-slate-400' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {[FiLinkedin, FiTwitter, FiGithub].map((Icon, i) => (
        <a key={i} href="#" aria-label="Social profile" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 transition-colors hover:bg-blue-600 hover:text-white">
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function TeachersPage() {
  const reduce = useReducedMotion();

  /* ---- Hero spotlight + parallax ---- */
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

  return (
    <div className="bg-[#020205] font-sans text-slate-100 antialiased">
      <Navbar />

      {/* ============================ HERO ============================ */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMove}
        onMouseLeave={handleHeroLeave}
        className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-24"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(79,70,229,0.22),transparent_40%),radial-gradient(circle_at_85%_25%,rgba(168,85,247,0.18),transparent_42%)]" />
        <div className="absolute inset-0 bg-linear-to-b from-[#020205]/0 via-[#020205]/40 to-[#020205]" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:56px_56px]" />
        {!reduce && <motion.div aria-hidden style={{ background: heroSpotlight }} className="pointer-events-none absolute inset-0" />}
        <motion.div aria-hidden style={{ x: orb1X, y: orb1Y }} className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-blue-600/20 blur-[100px]" />
        <motion.div aria-hidden style={{ x: orb2X, y: orb2Y }} className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-purple-600/20 blur-[110px]" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: easeOut }} className="space-y-8">
            <span className="inline-flex items-center gap-3 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-200 ring-1 ring-blue-200/10">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
              </span>
              Our teachers
            </span>

            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl xl:text-7xl">
              Learn from mentors who{' '}
              <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">ship real products.</span>
            </h1>

            <p className="max-w-xl text-lg leading-8 text-slate-300">
              Our instructors combine industry experience with hands-on coaching, so you build work that stands out and grow with confidence.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <MagneticButton
                href="/pages/courses"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/25"
              >
                Explore courses
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </MagneticButton>
              <MagneticButton
                href="/pages/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur transition-colors hover:border-blue-500/40 hover:text-blue-200"
              >
                Talk to a mentor
              </MagneticButton>
            </div>
          </motion.div>

          {/* featured mentor — 3D tilt */}
          <motion.div initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, delay: 0.15, ease: easeOut }}>
            <Tilt3D>
              <SpotlightCard className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl">
                <div className="relative overflow-hidden rounded-[1.4rem] border border-white/10">
                  <img src="/image1.jpg" alt="Featured mentor leading a workshop" className="h-72 w-full object-cover sm:h-80" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-blue-600/90 px-3 py-1 text-xs font-semibold text-white">Featured mentor</span>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-2xl font-semibold text-white">Amina Rahman</h2>
                    <p className="text-sm text-slate-300">Head Instructor · React, Next.js</p>
                    <div className="mt-2 flex items-center gap-2"><Stars n={5} /> <span className="text-sm text-slate-300">4.9</span></div>
                  </div>
                </div>
                <div className="flex items-center justify-between px-2 pb-1 pt-4">
                  <p className="max-w-[16rem] text-sm leading-6 text-slate-400">Guided code reviews, real-world demos, and portfolio feedback.</p>
                  <Socials />
                </div>
              </SpotlightCard>
            </Tilt3D>
          </motion.div>
        </div>
      </section>

      {/* ============================ STATS ============================ */}
      <section className="pb-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <SpotlightCard className="rounded-3xl border border-white/10 bg-slate-950/60 p-7 text-center">
                  <p className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
                    {s.display ? s.display : <CountUp to={s.to} />}
                    {s.suffix}
                  </p>
                  <p className="mt-2 text-sm uppercase tracking-[0.2em] text-slate-400">{s.label}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ MEET THE TEAM ============================ */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-blue-300">Meet the team</p>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Instructors, mentors & career coaches</h2>
            <p className="mt-4 text-slate-400">Every teacher brings practical experience from startups, agencies, and product teams to help you build work-ready skills.</p>
          </Reveal>

          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {teachers.map((teacher, i) => (
              <Reveal key={teacher.name} delay={i * 0.06}>
                <motion.div whileHover={reduce ? undefined : { y: -8 }} transition={{ duration: 0.3 }} className="h-full">
                  <SpotlightCard className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-950/60 shadow-xl shadow-black/20">
                    <div className="relative overflow-hidden rounded-t-3xl">
                      <img src={teacher.img} alt={teacher.name} className="h-64 w-full object-cover transition-transform duration-500 hover:scale-105" />
                      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-transparent" />
                      <span className="absolute left-4 top-4 rounded-full bg-blue-600/90 px-3 py-1 text-xs font-semibold text-white">{teacher.role}</span>
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                        <h3 className="text-2xl font-semibold text-white">{teacher.name}</h3>
                        <Socials />
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <p className="flex-1 leading-7 text-slate-400">{teacher.description}</p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {teacher.tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-blue-200">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ WHY MENTORS MATTER ============================ */}
      <section className="bg-slate-950/40 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            {/* reasons */}
            <Reveal>
              <SpotlightCard className="h-full rounded-[2rem] border border-white/10 bg-slate-950/60 p-8 sm:p-10">
                <p className="mb-4 text-sm uppercase tracking-[0.35em] text-blue-300">Why mentors matter</p>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Feedback and direction that accelerates your growth</h2>
                <p className="mt-4 leading-8 text-slate-400">
                  Our teachers do more than share lessons. They review your work, highlight what matters, and keep you on track with career-focused guidance.
                </p>
                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  {reasons.map((r) => {
                    const Icon = r.icon;
                    return (
                      <div key={r.title} className="flex items-start gap-4">
                        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-blue-500/15 text-blue-300 ring-1 ring-white/10">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="font-semibold text-white">{r.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-slate-400">{r.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SpotlightCard>
            </Reveal>

            {/* success stories */}
            <Reveal delay={0.1}>
              <SpotlightCard glow="rgba(168,85,247,0.18)" className="flex h-full flex-col gap-5 rounded-4xl border border-white/10 bg-linear-to-br from-purple-600/10 to-slate-950/60 p-8 sm:p-10">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Trusted results</p>
                  <h3 className="mt-3 text-2xl font-bold text-white">Real student success stories</h3>
                </div>
                {successStories.map((s) => (
                  <div key={s.name} className="flex flex-1 flex-col justify-center rounded-2xl border border-white/10 bg-black/40 p-6 mt-3">
                    <div className="mb-3"><Stars n={5} /></div>
                    <p className="text-lg leading-relaxed text-slate-200">“{s.quote}”</p>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-500 font-bold text-white">{s.name.charAt(0)}</span>
                      <div>
                        <p className="text-sm font-semibold text-white">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </SpotlightCard>
            </Reveal>
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
                <h2 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">Ready to learn from mentors who’ve done it?</h2>
                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                  Join a cohort, get personal feedback, and build the skills and portfolio that get you hired.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <MagneticButton
                    href="/pages/courses"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-10 py-4 text-base font-semibold text-white shadow-xl shadow-blue-600/30"
                  >
                    Explore courses
                    <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </MagneticButton>
                  <span className="flex items-center gap-2 text-sm text-slate-400">
                    <FiCheck className="h-4 w-4 text-emerald-400" /> Mentored by industry experts
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
