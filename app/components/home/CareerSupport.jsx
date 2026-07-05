'use client';

import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import Reveal from '../motion/Reveal';
import MagneticButton from '../motion/MagneticButton';
import { careerSupport } from './data';

export default function CareerSupport() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-primary/10 via-surface-elevated to-accent/10 p-10 shadow-elevated">
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/20 blur-3xl dark:bg-primary/30" />
              <div className="absolute -left-4 -bottom-4 h-32 w-32 rounded-full bg-accent/20 blur-3xl dark:bg-accent/30" />
              <div className="relative">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">
                  Career support
                </p>
                <p className="mt-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-7xl font-bold leading-none text-transparent sm:text-8xl">
                  83%
                </p>
                <p className="mt-4 text-2xl font-semibold text-text">
                  Job placement rate
                </p>
                <p className="mt-3 text-base leading-7 text-text-muted">
                  Graduation-এর ৬ মাসের মধ্যে আমাদের 83% students hired হন — freelance বা full-time।
                </p>
                <MagneticButton
                  href="/pages/courses"
                  as="a"
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25"
                >
                  Explore career tracks <FiArrowRight />
                </MagneticButton>
              </div>
            </div>
          </Reveal>

          <div className="space-y-6">
            <Reveal>
              <div>
                <h2 className="text-4xl font-bold tracking-tight text-text sm:text-5xl">
                  Graduation-এর পরেও পাশে থাকি
                </h2>
                <p className="mt-4 text-lg text-text-muted">
                  Course শেষ হলেই relationship শেষ না — job পাওয়া, freelance client পাওয়া, career grow করা — সবটাতে actively help করি।
                </p>
              </div>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2">
              {careerSupport.map((c, i) => {
                const Icon = c.icon;
                return (
                  <Reveal key={c.title} delay={i * 0.08}>
                    <div className="flex h-full gap-4 rounded-2xl border border-border bg-surface-elevated p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25">
                      <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-text">{c.title}</p>
                        <p className="mt-1 text-sm leading-6 text-text-muted">
                          {c.desc}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
