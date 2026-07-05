'use client';

import Reveal from '../motion/Reveal';
import Tilt3D from '../motion/Tilt3D';
import { studentProjects } from './data';

export default function StudentProjects() {
  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-primary">
            Student projects
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-text sm:text-5xl">
            Real projects, shipped by students
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            আমাদের students শুধু শেখেন না — এই projects live-এ ship করেছেন। Just watching না, actual building।
          </p>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {studentProjects.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.06}>
              <Tilt3D max={10} className="h-full">
                <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface-elevated shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated">
                  <div
                    className={`relative h-48 overflow-hidden bg-gradient-to-br ${p.gradient}`}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.25),transparent_55%)]" />
                    <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:24px_24px]" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
                          Portfolio project
                        </p>
                        <h3 className="mt-1 text-lg font-bold leading-tight text-white">
                          {p.title}
                        </h3>
                      </div>
                      <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                        Live
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-sm text-text-muted">
                      Built by{' '}
                      <span className="font-semibold text-text">{p.student}</span>
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.tech.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-text-muted"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Tilt3D>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
