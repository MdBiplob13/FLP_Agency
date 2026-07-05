'use client';

import { FiCheck } from 'react-icons/fi';
import Reveal from '../motion/Reveal';
import { learningOutcomes } from './data';

export default function LearningOutcomes() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-primary">
            Learning outcomes
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-text sm:text-5xl">
            শেষে কী পাবেন
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            Just theory না — actual skills + tangible outputs। Employer-ready হয়ে graduate করবেন।
          </p>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-surface-elevated to-surface-elevated p-8 shadow-card">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                You will learn
              </p>
              <h3 className="mt-3 text-2xl font-bold text-text">
                Skills & concepts
              </h3>
              <ul className="mt-6 space-y-4">
                {learningOutcomes.learn.map((l) => (
                  <li key={l} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary/15 text-primary">
                      <FiCheck className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-base leading-7 text-text">{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="rounded-3xl border border-border bg-gradient-to-br from-accent/5 via-surface-elevated to-surface-elevated p-8 shadow-card">
              <p className="text-xs font-bold uppercase tracking-widest text-accent">
                You will build
              </p>
              <h3 className="mt-3 text-2xl font-bold text-text">
                Real tangible outputs
              </h3>
              <ul className="mt-6 space-y-4">
                {learningOutcomes.build.map((l) => (
                  <li key={l} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent/15 text-accent">
                      <FiCheck className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-base leading-7 text-text">{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
