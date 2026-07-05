'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FiArrowRight, FiBriefcase } from 'react-icons/fi';
import Reveal from '../motion/Reveal';
import Stars from '../motion/Stars';
import { successStories } from './data';

const AUTOPLAY_MS = 6000;

export default function SuccessStories() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((next) => {
    setDirection(next > index ? 1 : -1);
    setIndex(((next % successStories.length) + successStories.length) % successStories.length);
  }, [index]);

  const next = useCallback(() => {
    setDirection(1);
    setIndex((i) => (i + 1) % successStories.length);
  }, []);

  useEffect(() => {
    if (paused || reduce) return;
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, reduce, next]);

  const story = successStories[index];

  const variants = {
    enter: (dir) => ({ opacity: 0, x: reduce ? 0 : dir * 60 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: reduce ? 0 : dir * -60 }),
  };

  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-primary">
            Success stories
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-text sm:text-5xl">
            Careers বদলেছে — তাদেরই কথায়
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            Fresh graduate থেকে freelancer, career switcher থেকে full-time engineer।
          </p>
        </Reveal>

        <Reveal>
          <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Slide viewport */}
            <div className="relative min-h-[26rem] overflow-hidden rounded-[2rem] border border-border bg-surface-elevated shadow-elevated sm:min-h-[22rem]">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/5 blur-3xl dark:bg-primary/15" />
              <div className="pointer-events-none absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-accent/5 blur-3xl dark:bg-accent/15" />

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={story.name}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex h-full flex-col gap-8 p-8 sm:flex-row sm:items-center sm:p-12"
                >
                  {/* Left: avatar + identity */}
                  <div className="flex flex-none flex-col items-center gap-4 sm:w-56">
                    <span
                      className={`flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br ${story.monogram} text-4xl font-bold text-white shadow-xl`}
                    >
                      {story.name.charAt(0)}
                    </span>
                    <div className="text-center">
                      <p className="text-lg font-bold text-text">{story.name}</p>
                      <p className="mt-1 text-sm text-text-muted">{story.after}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 pt-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="rounded-full border border-border bg-surface-muted px-2.5 py-1 font-medium text-text-subtle line-through">
                          {story.before}
                        </span>
                        <FiArrowRight className="h-3 w-3 text-primary" />
                        <span className="rounded-full border border-success/25 bg-success/10 px-2.5 py-1 font-semibold text-success">
                          {story.after}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: quote */}
                  <div className="flex flex-1 flex-col justify-between gap-6">
                    <div>
                      <Stars n={5} />
                      <p className="mt-5 text-xl leading-relaxed text-text sm:text-2xl">
                        &ldquo;{story.quote}&rdquo;
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
                      <div className="flex items-center gap-2 text-sm text-text-muted">
                        <FiBriefcase className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-text">{story.company}</span>
                      </div>
                      <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-lg font-bold text-transparent">
                        {story.salary}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

          {/* Dot indicators */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {successStories.map((s, i) => (
              <button
                key={s.name}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to story ${i + 1}`}
                aria-current={i === index}
                className={`h-2 cursor-pointer rounded-full transition-all ${
                  i === index
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-border-strong hover:bg-text-muted'
                }`}
              />
            ))}
          </div>

        </Reveal>
      </div>
    </section>
  );
}
