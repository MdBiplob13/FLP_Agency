'use client';

import { FiArrowRight, FiShield, FiClock, FiUsers } from 'react-icons/fi';
import Reveal from '../motion/Reveal';
import MagneticButton from '../motion/MagneticButton';
import SpotlightCard from '../motion/SpotlightCard';

const guarantees = [
  { icon: FiShield, label: '30-day refund' },
  { icon: FiClock, label: 'Lifetime access' },
  { icon: FiUsers, label: 'Mentor support' },
];

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <SpotlightCard
            glow="rgba(99,102,241,0.28)"
            size={480}
            className="relative rounded-[2.5rem] border border-border bg-gradient-to-br from-primary/10 via-surface to-accent/10 p-10 text-center shadow-elevated sm:p-16"
          >
            <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:44px_44px] text-text" />
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl dark:bg-primary/30" />
            <div className="pointer-events-none absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl dark:bg-accent/30" />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                New cohorts open
              </span>
              <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-text sm:text-5xl md:text-6xl">
                আজই শুরু করুন — this year, your career gets a real upgrade।
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-text-muted">
                12,400+ learners এর সাথে যোগ দিন — expert mentorship-এ real skills তৈরি করুন। First lessons free।
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <MagneticButton
                  href="#courses"
                  as="a"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-10 py-4 text-base font-semibold text-white shadow-xl shadow-primary/30"
                >
                  Get started free
                  <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                </MagneticButton>
                <a
                  href="/pages/contact"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border-strong bg-surface-elevated px-8 py-4 text-base font-semibold text-text transition-colors hover:border-primary/40 hover:text-primary"
                >
                  Talk to an advisor
                </a>
              </div>

              <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-6 border-t border-border pt-8">
                {guarantees.map((g) => {
                  const Icon = g.icon;
                  return (
                    <div
                      key={g.label}
                      className="flex items-center gap-2 text-sm text-text-muted"
                    >
                      <Icon className="h-4 w-4 text-success" />
                      {g.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  );
}
