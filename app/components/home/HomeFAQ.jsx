'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import Reveal from '../motion/Reveal';
import { faqItems } from './data';

export default function HomeFAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal className="mb-14 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-primary">
            FAQ
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-text sm:text-5xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            আপনার সবচেয়ে common questions — এক জায়গায় answer।
          </p>
        </Reveal>

        <div className="space-y-3">
          {faqItems.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 0.03}>
                <div
                  className={`overflow-hidden rounded-2xl border transition-colors ${
                    isOpen
                      ? 'border-primary/30 bg-surface-elevated shadow-card'
                      : 'border-border bg-surface-elevated'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-surface-muted"
                  >
                    <span className="text-base font-semibold text-text sm:text-lg">
                      {f.q}
                    </span>
                    <span
                      className={`flex h-8 w-8 flex-none items-center justify-center rounded-full border transition-all ${
                        isOpen
                          ? 'border-primary bg-primary text-white rotate-45'
                          : 'border-border bg-surface text-text-muted'
                      }`}
                    >
                      <FiPlus className="h-4 w-4" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <p className="border-t border-border px-6 py-5 text-base leading-7 text-text-muted">
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
