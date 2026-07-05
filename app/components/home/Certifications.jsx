'use client';

import { FiCheck, FiAward } from 'react-icons/fi';
import Reveal from '../motion/Reveal';
import { certifications } from './data';

export default function Certifications() {
  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-primary">
            Certifications
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-text sm:text-5xl">
            Skills-এর প্রমাণ — যা employers বিশ্বাস করে
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            Verifiable, shareable, industry-recognized। LinkedIn থেকে resume — যেকোনো জায়গায় use করতে পারবেন।
          </p>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2">
          {certifications.map((cert, i) => (
            <Reveal key={cert.title} delay={i * 0.1}>
              <div className="group relative overflow-hidden rounded-[2rem] border border-border bg-surface-elevated shadow-elevated transition-transform duration-500 hover:-translate-y-1">
                <div
                  className={`relative flex h-56 items-center justify-center overflow-hidden bg-gradient-to-br ${cert.tone}`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent_55%)]" />
                  <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:32px_32px]" />

                  {/* Faux certificate */}
                  <div className="relative w-[75%] rounded-xl border-4 border-white/40 bg-white/10 p-5 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">
                        GHL Learning
                      </span>
                      <FiAward className="h-5 w-5 text-white" />
                    </div>
                    <div className="mt-3 h-2 w-3/4 rounded bg-white/40" />
                    <div className="mt-2 h-2 w-1/2 rounded bg-white/30" />
                    <div className="mt-6 flex items-end justify-between">
                      <div className="space-y-1">
                        <div className="h-1.5 w-16 rounded bg-white/40" />
                        <div className="h-1.5 w-12 rounded bg-white/30" />
                      </div>
                      <div className="rounded-full bg-white/25 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white">
                        Verified
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    {cert.subtitle}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-text">
                    {cert.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-text-muted">
                    {cert.desc}
                  </p>
                  <ul className="mt-5 space-y-2">
                    {cert.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-sm text-text"
                      >
                        <FiCheck className="h-4 w-4 flex-none text-success" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
