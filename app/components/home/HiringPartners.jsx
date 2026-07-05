'use client';

import Reveal from '../motion/Reveal';
import { hiringPartners } from './data';

const TONES = [
  'from-indigo-500 to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-blue-500',
  'from-purple-500 to-pink-500',
];

export default function HiringPartners() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-primary">
            Hiring partners
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Our graduates work at
          </h2>
          <p className="mt-3 text-base text-text-muted">
            Bangladesh-এর top companies-এ actively hired হচ্ছেন আমাদের students।
          </p>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {hiringPartners.map((p, i) => (
              <div
                key={p}
                className="group flex items-center gap-3 rounded-2xl border border-border bg-surface-elevated px-4 py-3 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-elevated"
              >
                <span
                  className={`flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-gradient-to-br ${TONES[i % TONES.length]} text-sm font-bold text-white`}
                >
                  {p
                    .split(' ')
                    .map((w) => w.charAt(0))
                    .slice(0, 2)
                    .join('')}
                </span>
                <span className="truncate text-sm font-semibold text-text">
                  {p}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
