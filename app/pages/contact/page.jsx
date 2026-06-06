'use client';

import { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import Footer from '../../components/footer/page.jsx';
import Navbar from '@/app/components/navbar/page.jsx';

const AnimatedSection = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) controls.start('visible');
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.75, delay } },
      }}
    >
      {children}
    </motion.div>
  );
};

export default function ContactPage() {
  const supportCards = [
    {
      icon: '✉️',
      title: 'Email support',
      detail: 'support@flp.com',
    },
    {
      icon: '📞',
      title: 'Call us',
      detail: '+1 234 567 890',
    },
    {
      icon: '🕒',
      title: 'Office hours',
      detail: 'Mon - Fri, 9am - 6pm',
    },
  ];

  const faqItems = [
    {
      question: 'How quickly do you respond?',
      answer: 'Our team replies to all contact requests within 24 hours on business days.',
    },
    {
      question: 'Can I get a custom learning proposal?',
      answer: 'Yes, we design course plans to match your goals and experience level.',
    },
    {
      question: 'Do you provide mentorship support?',
      answer: 'We connect learners with mentors, feedback loops, and project reviews.',
    },
  ];

  return (
    <div className="bg-black text-white">
        <Navbar/>
      <section className="relative overflow-hidden bg-[#020205]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.18),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_24%)] pointer-events-none" />
        <div className="absolute inset-0 bg-linear-to-b from-black/90 via-black/80 to-black" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <AnimatedSection>
              <div className="space-y-8">
                <span className="inline-flex items-center gap-3 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  Contact our support team
                </span>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                  Let&apos;s build your next learning experience together.
                </h1>

                <p className="max-w-2xl text-lg leading-8 text-gray-300">
                  Send us a message, request a course proposal, or ask about mentoring. We&apos;re here to help you choose the right path and move faster.
                </p>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-4xl border border-white/10 bg-slate-950/80 p-5 shadow-2xl shadow-black/20">
                    <p className="text-sm uppercase tracking-[0.35em] text-gray-400">Response</p>
                    <p className="mt-4 text-2xl font-semibold text-white">24 hours</p>
                  </div>
                  <div className="rounded-4xl border border-white/10 bg-slate-950/80 p-5 shadow-2xl shadow-black/20">
                    <p className="text-sm uppercase tracking-[0.35em] text-gray-400">Support</p>
                    <p className="mt-4 text-2xl font-semibold text-white">Global team</p>
                  </div>
                  <div className="rounded-4xl border border-white/10 bg-slate-950/80 p-5 shadow-2xl shadow-black/20">
                    <p className="text-sm uppercase tracking-[0.35em] text-gray-400">Projects</p>
                    <p className="mt-4 text-2xl font-semibold text-white">Career-friendly</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/85 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="rounded-4xl border border-white/10 bg-black/60 p-8 text-white shadow-xl shadow-black/20">
                  <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Need help now?</p>
                  <h2 className="mt-4 text-3xl font-bold text-white">Get direct support from our team.</h2>
                  <p className="mt-4 text-gray-400 leading-7">
                    Whether you want a course recommendation or a customized learning plan, our experts are ready to assist.
                  </p>
                  <div className="mt-8 space-y-4">
                    {supportCards.map((card) => (
                      <div key={card.title} className="flex items-center gap-4 rounded-4xl bg-white/5 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-500/10 text-2xl text-blue-200">{card.icon}</div>
                        <div>
                          <p className="text-sm uppercase tracking-[0.35em] text-gray-400">{card.title}</p>
                          <p className="mt-1 text-base font-semibold text-white">{card.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-950/90">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
            <AnimatedSection>
              <div className="rounded-4xl border border-white/10 bg-black/60 p-8 shadow-2xl shadow-black/20">
                <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Tell us about your project</p>
                <h2 className="mt-4 text-4xl font-bold text-white">Start with a quick message.</h2>
                <p className="mt-4 text-gray-400 leading-7">
                  Fill out the form and we&apos;ll reach out with the best next step for your learning journey.
                </p>

                <form className="mt-10 space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-semibold text-gray-300">Name</span>
                      <input
                        type="text"
                        placeholder="Your name"
                        className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold text-gray-300">Email</span>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-sm font-semibold text-gray-300">Subject</span>
                    <input
                      type="text"
                      placeholder="What would you like to discuss?"
                      className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-gray-300">Message</span>
                    <textarea
                      rows={6}
                      placeholder="Tell us more about your needs"
                      className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </label>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-500/20 transition hover:scale-[1.01]"
                  >
                    Send message
                  </button>
                </form>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="space-y-8">
                <div className="rounded-4xl border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/20">
                  <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Office details</p>
                  <h2 className="mt-4 text-3xl font-bold text-white">Our studio is accessible worldwide.</h2>
                  <div className="mt-8 space-y-6 text-gray-300">
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-gray-400">Location</p>
                      <p className="mt-2 text-lg text-white">124 Creative Avenue, Dhaka, Bangladesh</p>
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-gray-400">General inquiries</p>
                      <p className="mt-2 text-lg text-white">hello@flp.com</p>
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-gray-400">Phone</p>
                      <p className="mt-2 text-lg text-white">+880 1234 567890</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-4xl border border-white/10 bg-black/60 p-8 shadow-2xl shadow-black/20">
                  <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Frequently asked</p>
                  <div className="mt-8 space-y-4">
                    {faqItems.map((item) => (
                      <div key={item.question} className="rounded-4xl border border-white/10 bg-slate-950/80 p-5">
                        <p className="font-semibold text-white">{item.question}</p>
                        <p className="mt-3 text-gray-400 leading-7">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-linear-to-r from-blue-600/10 via-transparent to-purple-600/10" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <div className="rounded-4xl border border-white/10 bg-slate-950/90 p-12 text-center shadow-2xl shadow-black/20">
              <p className="text-sm uppercase tracking-[0.35em] text-blue-300 mb-4">Still have questions?</p>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">We&apos;re happy to help you get started.</h2>
              <p className="mx-auto max-w-2xl text-base leading-8 text-gray-400 mb-10">
                Reach out for consultations, course matching, or collaboration ideas. We respond quickly and keep things simple.
              </p>
              <button className="rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-12 py-4 text-lg font-semibold text-white shadow-xl shadow-blue-500/20 transition hover:scale-[1.01]">
                Message us now
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
