'use client';

import Link from 'next/link';
import { FiArrowRight, FiZap } from 'react-icons/fi';
import Reveal from '../motion/Reveal';

export default function InlineCTA({
  eyebrow = 'Ready to start',
  title = 'First lesson free — কোনো card লাগবে না।',
  desc = '30-day money-back guarantee। No hidden fees। Enrolment মাত্র কয়েক minute-এ।',
  primaryLabel = 'Start learning',
  primaryHref = '/pages/courses',
  secondaryLabel = 'Talk to us',
  secondaryHref = '/pages/contact',
}) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-r from-primary/10 via-surface-elevated to-accent/10 p-8 shadow-elevated sm:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl dark:bg-primary/30" />
            <div className="pointer-events-none absolute -left-10 -bottom-16 h-52 w-52 rounded-full bg-accent/20 blur-3xl dark:bg-accent/30" />

            <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                  <FiZap className="h-3.5 w-3.5" /> {eyebrow}
                </span>
                <h3 className="mt-4 text-3xl font-bold tracking-tight text-text sm:text-4xl">
                  {title}
                </h3>
                <p className="mt-3 max-w-xl text-base leading-7 text-text-muted">
                  {desc}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  href={primaryHref}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:brightness-110"
                >
                  {primaryLabel} <FiArrowRight />
                </Link>
                <Link
                  href={secondaryHref}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border-strong bg-surface-elevated px-6 py-3 text-sm font-semibold text-text transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {secondaryLabel}
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
