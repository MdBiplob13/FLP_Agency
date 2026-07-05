'use client';

import Reveal from '../motion/Reveal';
import { platformStats } from './data';

export default function PlatformStats() {
  return (
    <section className="border-y border-border bg-surface py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {platformStats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="text-center">
                <p className="bg-gradient-to-r from-primary to-accent bg-clip-text text-5xl font-bold text-transparent sm:text-6xl">
                  {s.metric}
                </p>
                <p className="mt-3 text-base font-semibold text-text">
                  {s.label}
                </p>
                <p className="mt-1 text-sm text-text-subtle">{s.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
