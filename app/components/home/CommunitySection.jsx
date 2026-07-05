'use client';

import { FiUsers, FiCalendar, FiMessageCircle, FiArrowRight } from 'react-icons/fi';
import Reveal from '../motion/Reveal';
import MagneticButton from '../motion/MagneticButton';
import { communityEvents } from './data';

export default function CommunitySection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <Reveal>
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-primary">
                Community
              </p>
              <h2 className="text-4xl font-bold tracking-tight text-text sm:text-5xl">
                একা শিখবেন না — 12,000+ learners এর সাথে
              </h2>
              <p className="mt-5 text-lg leading-8 text-text-muted">
                Discord আর Facebook group-এ active discussion, peer support, project feedback আর job leads। Weekly meetups Dhaka, Chittagong, Sylhet-এ। Monthly speaker events।
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-card">
                  <div className="flex items-center gap-2 text-primary">
                    <FiUsers className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Active now
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-text">2,400+</p>
                  <p className="text-sm text-text-muted">online learners</p>
                </div>
                <div className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-card">
                  <div className="flex items-center gap-2 text-accent">
                    <FiMessageCircle className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      This week
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-text">184</p>
                  <p className="text-sm text-text-muted">discussions</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <MagneticButton
                  href="#"
                  as="a"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25"
                >
                  Join Discord community <FiArrowRight />
                </MagneticButton>
                <a
                  href="#"
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border-strong bg-surface-elevated px-6 py-3 text-sm font-semibold text-text transition-colors hover:border-primary/40 hover:text-primary"
                >
                  Facebook group
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-3xl border border-border bg-surface-elevated shadow-elevated">
              <div className="flex items-center justify-between border-b border-border bg-surface-muted px-5 py-4">
                <div className="flex items-center gap-2 text-primary">
                  <FiCalendar className="h-5 w-5" />
                  <span className="text-sm font-semibold text-text">
                    Upcoming events
                  </span>
                </div>
                <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
                  This month
                </span>
              </div>
              <ul className="divide-y divide-border">
                {communityEvents.map((e) => (
                  <li
                    key={e.title}
                    className="flex cursor-pointer items-center gap-4 px-5 py-5 transition-colors hover:bg-surface-muted"
                  >
                    <div className="flex h-14 w-14 flex-none flex-col items-center justify-center rounded-xl border border-border bg-surface text-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                        {e.date.split(' ')[0]}
                      </span>
                      <span className="text-xl font-bold leading-none text-text">
                        {e.date.split(' ')[1]}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-text">
                        {e.title}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-widest text-text-subtle">
                        {e.kind} • Free
                      </p>
                    </div>
                    <FiArrowRight className="h-4 w-4 flex-none text-text-subtle" />
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
