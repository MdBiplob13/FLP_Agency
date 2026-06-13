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
  AnimatePresence,
} from 'framer-motion';
import {
  FiArrowRight,
  FiMail,
  FiPhone,
  FiClock,
  FiMapPin,
  FiChevronDown,
  FiSend,
  FiCheckCircle,
  FiLinkedin,
  FiTwitter,
  FiGithub,
} from 'react-icons/fi';
import Footer from '../../components/footer/page.jsx';
import Navbar from '@/app/components/navbar/page.jsx';

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */

const supportCards = [
  { icon: FiMail, title: 'Email support', detail: 'support@flp.com' },
  { icon: FiPhone, title: 'Call us', detail: '+1 234 567 890' },
  { icon: FiClock, title: 'Office hours', detail: 'Mon – Fri, 9am – 6pm' },
];

const officeDetails = [
  { icon: FiMapPin, label: 'Location', value: '124 Creative Avenue, Dhaka, Bangladesh' },
  { icon: FiMail, label: 'General inquiries', value: 'hello@flp.com' },
  { icon: FiPhone, label: 'Phone', value: '+880 1234 567890' },
];

const faqItems = [
  { question: 'How quickly do you respond?', answer: 'Our team replies to all contact requests within 24 hours on business days.' },
  { question: 'Can I get a custom learning proposal?', answer: 'Yes, we design course plans to match your goals and experience level.' },
  { question: 'Do you provide mentorship support?', answer: 'We connect learners with mentors, feedback loops, and project reviews.' },
];

const heroStats = [
  { k: 'Response', v: '24 hours' },
  { k: 'Support', v: 'Global team' },
  { k: 'Projects', v: 'Career-friendly' },
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

function Tilt3D({ children, className = '', max = 12 }) {
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
    <motion.div ref={ref} onMouseMove={handleMove} onMouseLeave={reset} style={{ rotateX: srx, rotateY: sry, transformPerspective: 1000 }} className={`[transform-style:preserve-3d] ${className}`}>
      {children}
    </motion.div>
  );
}

function Socials() {
  return (
    <div className="flex items-center gap-2 text-slate-400">
      {[FiLinkedin, FiTwitter, FiGithub].map((Icon, i) => (
        <a key={i} href="#" aria-label="Social profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 transition-colors hover:bg-blue-600 hover:text-white">
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function ContactPage() {
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

  /* ---- Contact form ---- */
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Please enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.message.trim()) errs.message = 'Please write a short message';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  }

  /* ---- FAQ accordion ---- */
  const [openFaq, setOpenFaq] = useState(0);

  const inputClass =
    'mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10';

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

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: easeOut }} className="space-y-8">
            <span className="inline-flex items-center gap-3 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-200 ring-1 ring-blue-200/10">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
              </span>
              Contact our support team
            </span>

            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl xl:text-7xl">
              Let’s build your next{' '}
              <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">learning experience.</span>
            </h1>

            <p className="max-w-xl text-lg leading-8 text-slate-300">
              Send a message, request a course proposal, or ask about mentoring. We’re here to help you choose the right path and move faster.
            </p>

            <div className="grid max-w-lg gap-4 sm:grid-cols-3">
              {heroStats.map((s) => (
                <div key={s.k} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{s.k}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{s.v}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* support card — 3D tilt */}
          <motion.div initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, delay: 0.15, ease: easeOut }}>
            <Tilt3D>
              <SpotlightCard className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Need help now?</p>
                <h2 className="mt-3 text-2xl font-bold text-white">Get direct support from our team</h2>
                <p className="mt-3 leading-7 text-slate-400">Whether you want a course recommendation or a custom learning plan, our experts are ready.</p>
                <div className="mt-7 space-y-3">
                  {supportCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <div key={card.title} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-blue-500/30">
                        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-blue-500/15 text-blue-300 ring-1 ring-white/10">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{card.title}</p>
                          <p className="mt-0.5 font-semibold text-white">{card.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-7 flex items-center justify-between border-t border-white/5 pt-6">
                  <span className="text-sm text-slate-400">Follow us</span>
                  <Socials />
                </div>
              </SpotlightCard>
            </Tilt3D>
          </motion.div>
        </div>
      </section>

      {/* ============================ FORM + SIDEBAR ============================ */}
      <section className="bg-slate-950/40 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
            {/* form */}
            <Reveal>
              <SpotlightCard className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8 sm:p-10">
                <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Tell us about your goals</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Start with a quick message</h2>
                <p className="mt-3 leading-7 text-slate-400">Fill out the form and we’ll reach out with the best next step for your learning journey.</p>

                <AnimatePresence mode="wait">
                  {sent ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-10 flex flex-col items-center rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-10 text-center"
                    >
                      <FiCheckCircle className="h-12 w-12 text-emerald-400" />
                      <h3 className="mt-4 text-xl font-semibold text-white">Message sent!</h3>
                      <p className="mt-2 text-slate-300">Thanks for reaching out — we’ll get back to you within 24 hours.</p>
                      <button onClick={() => setSent(false)} className="mt-6 rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:border-blue-500/40 hover:text-blue-200">
                        Send another
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} noValidate className="mt-10 space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-sm font-medium text-slate-300">Name</span>
                          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your name" className={inputClass} />
                          {errors.name && <p className="mt-2 text-sm text-red-400">{errors.name}</p>}
                        </label>
                        <label className="block">
                          <span className="text-sm font-medium text-slate-300">Email</span>
                          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className={inputClass} />
                          {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email}</p>}
                        </label>
                      </div>

                      <label className="block">
                        <span className="text-sm font-medium text-slate-300">Subject</span>
                        <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="What would you like to discuss?" className={inputClass} />
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-slate-300">Message</span>
                        <textarea rows={6} name="message" value={form.message} onChange={handleChange} placeholder="Tell us more about your needs" className={inputClass} />
                        {errors.message && <p className="mt-2 text-sm text-red-400">{errors.message}</p>}
                      </label>

                      <MagneticButton
                        as="button"
                        type="submit"
                        className="group inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/25"
                      >
                        Send message
                        <FiSend className="transition-transform group-hover:translate-x-1" />
                      </MagneticButton>
                    </motion.form>
                  )}
                </AnimatePresence>
              </SpotlightCard>
            </Reveal>

            {/* sidebar */}
            <div className="space-y-8">
              <Reveal>
                <SpotlightCard className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8">
                  <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Office details</p>
                  <h3 className="mt-3 text-2xl font-bold text-white">Accessible worldwide</h3>
                  <div className="mt-7 space-y-5">
                    {officeDetails.map((d) => {
                      const Icon = d.icon;
                      return (
                        <div key={d.label} className="flex items-start gap-4">
                          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-blue-500/15 text-blue-300 ring-1 ring-white/10">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{d.label}</p>
                            <p className="mt-1 text-white">{d.value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SpotlightCard>
              </Reveal>

              <Reveal delay={0.05}>
                <SpotlightCard className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8">
                  <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Frequently asked</p>
                  <div className="mt-6 space-y-3">
                    {faqItems.map((item, i) => {
                      const open = openFaq === i;
                      return (
                        <div key={item.question} className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                          <button onClick={() => setOpenFaq(open ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left" aria-expanded={open}>
                            <span className="font-medium text-white">{item.question}</span>
                            <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="flex-none text-blue-300">
                              <FiChevronDown className="h-5 w-5" />
                            </motion.span>
                          </button>
                          <AnimatePresence initial={false}>
                            {open && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: easeOut }}>
                                <p className="px-5 pb-4 leading-7 text-slate-400">{item.answer}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </SpotlightCard>
              </Reveal>
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
                <h2 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">Still have questions?</h2>
                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                  Reach out for consultations, course matching, or collaboration ideas. We respond quickly and keep things simple.
                </p>
                <div className="mt-10 flex justify-center">
                  <MagneticButton
                    href="mailto:hello@flp.com"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-10 py-4 text-base font-semibold text-white shadow-xl shadow-blue-600/30"
                  >
                    Message us now
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
