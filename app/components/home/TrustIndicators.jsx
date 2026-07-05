'use client';

import Reveal from '../motion/Reveal';
import { trustIndicators } from './data';

export default function TrustIndicators() {
  return (
    <section className="border-y border-border bg-surface py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustIndicators.map((t, i) => {
            const Icon = t.icon;
            return (
              <Reveal key={t.label} delay={i * 0.06}>
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="font-semibold text-text">{t.label}</p>
                    <p className="text-sm text-text-muted">{t.sub}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
