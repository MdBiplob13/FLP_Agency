'use client';

import { FiCheck } from 'react-icons/fi';
import Reveal from '../motion/Reveal';
import { methodology } from './data';

export default function LearningMethodology() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-primary">
            Learning methodology
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-text sm:text-5xl">
            Learn → Build → Ship
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            শুধু video দেখা না — actual industry workflow follow করে হাতে-কলমে শেখা।
          </p>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-3">
          {methodology.map((m, i) => {
            const Icon = m.icon;
            return (
              <Reveal key={m.step} delay={i * 0.1}>
                <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface-elevated p-8 shadow-card">
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl dark:bg-primary/10" />
                  <div className="relative flex items-center gap-3">
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                      Step {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-text-subtle">
                      {m.step}
                    </span>
                  </div>
                  <span className="mt-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                    <Icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-text">
                    {m.title}
                  </h3>
                  <p className="mt-2 text-base leading-7 text-text-muted">
                    {m.desc}
                  </p>
                  <ul className="mt-5 space-y-2">
                    {m.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-text">
                        <FiCheck className="mt-0.5 h-4 w-4 flex-none text-success" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
