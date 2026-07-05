'use client';

import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import Reveal from '../motion/Reveal';
import SpotlightCard from '../motion/SpotlightCard';
import { categories } from './data';

export default function CategoryGrid() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-primary">
            Popular categories
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-text sm:text-5xl">
            যে skill আপনার career বদলাবে
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            Beginner থেকে advanced — Bangladeshi industry-এ যেসব skills-এর demand সবচেয়ে বেশি।
          </p>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => {
            const Icon = c.icon;
            return (
              <Reveal key={c.title} delay={i * 0.06}>
                <Link
                  href="/pages/courses"
                  className="group block h-full cursor-pointer"
                >
                  <SpotlightCard className="flex h-full flex-col rounded-3xl border border-border bg-surface-elevated p-7 shadow-card transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-elevated">
                    <div className="flex items-start justify-between">
                      <span
                        className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${c.tone} text-white shadow-lg`}
                      >
                        <Icon className="h-7 w-7" />
                      </span>
                      <span className="rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
                        {c.count}
                      </span>
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-text">
                      {c.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-text-muted">
                      {c.desc}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-transform group-hover:translate-x-1">
                      Explore courses <FiArrowRight className="h-4 w-4" />
                    </span>
                  </SpotlightCard>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
