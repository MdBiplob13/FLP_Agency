'use client';

import Link from 'next/link';
import { FiArrowRight, FiUsers } from 'react-icons/fi';
import Reveal from '../motion/Reveal';
import { instructors } from './data';

export default function FeaturedInstructors() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mb-14 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-primary">
              Industry mentors
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-text sm:text-5xl">
              যাদের কাছে শিখবেন
            </h2>
            <p className="mt-4 text-lg text-text-muted">
              Working professionals — Pathao, bKash, Chaldal-এর মতো companies-এ actively কাজ করছেন।
            </p>
          </div>
          <Link
            href="/pages/teachers"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border-strong bg-surface-elevated px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:border-primary/40 hover:text-primary"
          >
            View all mentors <FiArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {instructors.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.08}>
              <Link
                href="/pages/teachers"
                className="group block h-full cursor-pointer"
              >
                <div className="flex h-full flex-col rounded-3xl border border-border bg-surface-elevated p-6 shadow-card transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-elevated">
                  <div
                    className={`relative flex h-40 items-end overflow-hidden rounded-2xl bg-gradient-to-br ${m.monogram}`}
                  >
                    <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent_55%)]" />
                    <span className="relative m-4 text-6xl font-bold leading-none tracking-tight text-white/90">
                      {m.name.charAt(0)}
                    </span>
                    <span className="absolute right-4 top-4 rounded-full bg-black/25 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      {m.company}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-text">
                    {m.name}
                  </h3>
                  <p className="mt-1 text-sm text-text-muted">{m.role}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {m.expertise.map((e) => (
                      <span
                        key={e}
                        className="rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-text-muted"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-sm text-text-muted">
                    <FiUsers className="h-4 w-4 text-primary" />
                    <span>
                      <span className="font-semibold text-text">{m.students}</span>{' '}
                      students trained
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
