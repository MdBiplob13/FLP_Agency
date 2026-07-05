'use client';

import Reveal from '../motion/Reveal';
import { roadmap } from './data';

export default function LearningRoadmap() {
  return (
    <section className="relative overflow-hidden bg-surface py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />

      <div className="relative mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-primary">
            Your learning roadmap
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-text sm:text-5xl">
            12-week structured path
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            Foundation থেকে placement — প্রতিটা week-এ পরিষ্কার লক্ষ্য আর deliverable।
          </p>
        </Reveal>

        {/* Timeline: horizontal on desktop, vertical on mobile */}
        <div className="relative">
          {/* Connector line */}
          <div className="pointer-events-none absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border-strong to-transparent lg:left-0 lg:right-0 lg:top-24 lg:h-px lg:w-full lg:bg-gradient-to-r" />

          <div className="grid gap-8 lg:grid-cols-6">
            {roadmap.map((r, i) => {
              const Icon = r.icon;
              return (
                <Reveal key={r.n} delay={i * 0.08}>
                  <div className="relative flex items-start gap-4 pl-16 lg:block lg:pl-0 lg:text-center">
                    <span className="absolute left-0 top-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/25 lg:relative lg:mx-auto lg:mb-6">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex-1 lg:flex-none">
                      <p className="text-xs font-bold uppercase tracking-widest text-primary">
                        {r.n}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-text">
                        {r.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-text-muted">
                        {r.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
