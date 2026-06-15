'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FiBookOpen,
  FiPlay,
  FiClock,
  FiLayers,
  FiCalendar,
  FiArrowRight,
  FiSearch,
  FiLoader,
  FiAlertTriangle,
} from 'react-icons/fi';
import useMyCourses from '@/hooks/course/myCoursesHook';

const FALLBACK_IMG = '/image1.jpg';

const fmtDateTime = (v) =>
  v ? new Date(v).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '';

/* ------------------------------------------------------------------ */
/*  Map a raw enrolled-course doc into the shape the cards render      */
/* ------------------------------------------------------------------ */

function normalize(c) {
  let lessons = 0;
  let minutes = 0;
  for (const section of c.curriculum || []) {
    for (const lesson of section.lessons || []) {
      lessons += 1;
      minutes += lesson.duration || 0;
    }
  }

  // Next upcoming class: earliest schedule slot still in the future, else the
  // earliest slot overall (so past schedules still show something sensible).
  const now = Date.now();
  const slots = [...(c.schedule || [])].sort(
    (a, b) => new Date(a.startDate) - new Date(b.startDate),
  );
  const upcoming = slots.find((s) => new Date(s.startDate).getTime() >= now) || null;

  return {
    id: c._id,
    title: c.title,
    category: c.category,
    img: c.thumbnail || FALLBACK_IMG,
    instructor: c.teachers?.[0]?.name || null,
    lessons,
    hours: Math.round(minutes / 60),
    nextClass: upcoming ? upcoming.startDate : null,
  };
}

/* ------------------------------------------------------------------ */
/*  Presentational helpers                                            */
/* ------------------------------------------------------------------ */

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
      <div className="flex items-center justify-between">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-white/10 ${accent}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-3xl font-bold text-white">{value}</span>
      </div>
      <p className="mt-4 text-sm uppercase tracking-[0.2em] text-slate-400">{label}</p>
    </div>
  );
}

function CourseCard({ course }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 transition-colors hover:border-white/20">
      {/* Thumbnail */}
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={course.img}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          {course.category}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-white">{course.title}</h3>
        {course.instructor && <p className="mt-1 text-xs text-slate-400">by {course.instructor}</p>}

        {/* Meta */}
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <FiLayers className="h-3.5 w-3.5 text-blue-300" /> {course.lessons} lessons
          </span>
          <span className="flex items-center gap-1.5">
            <FiClock className="h-3.5 w-3.5 text-blue-300" /> {course.hours}h
          </span>
        </div>

        {course.nextClass && (
          <p className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <FiCalendar className="h-3.5 w-3.5 text-emerald-300" /> Next class: {fmtDateTime(course.nextClass)}
          </p>
        )}

        {/* Action */}
        <div className="mt-5 border-t border-white/5 pt-4">
          <Link
            href={`/pages/dashboard/user/learn/${course.id}`}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110"
          >
            <FiPlay className="h-4 w-4" /> Continue learning
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function MyCoursesPage() {
  const { courses: raw, coursesLoading, coursesError } = useMyCourses();
  const [search, setSearch] = useState('');

  const courses = useMemo(() => (raw || []).map(normalize), [raw]);

  const stats = useMemo(() => {
    const totalLessons = courses.reduce((n, c) => n + c.lessons, 0);
    const totalHours = courses.reduce((n, c) => n + c.hours, 0);
    const upcoming = courses.filter((c) => c.nextClass).length;
    return [
      { icon: FiBookOpen, label: 'Enrolled', value: courses.length, accent: 'bg-blue-500/15 text-blue-300' },
      { icon: FiLayers, label: 'Total lessons', value: totalLessons, accent: 'bg-purple-500/15 text-purple-300' },
      { icon: FiClock, label: 'Hours', value: totalHours, accent: 'bg-emerald-500/15 text-emerald-300' },
      { icon: FiCalendar, label: 'Upcoming classes', value: upcoming, accent: 'bg-amber-500/15 text-amber-300' },
    ];
  }, [courses]);

  const filtered = useMemo(() => {
    if (!search.trim()) return courses;
    const q = search.toLowerCase();
    return courses.filter((c) =>
      `${c.title} ${c.category} ${c.instructor || ''}`.toLowerCase().includes(q),
    );
  }, [courses, search]);

  return (
    <div>
      {/* Header */}
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-blue-300">My learning</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">My courses</h1>
        <p className="mt-2 text-slate-400">Everything you’re enrolled in, in one place.</p>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Search */}
      <div className="mt-10">
        <label className="relative block w-full sm:max-w-xs">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search my courses…"
            className="w-full rounded-full border border-white/10 bg-slate-900/80 py-3 pl-12 pr-4 text-sm text-white outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
          />
        </label>
      </div>

      {/* Grid / states */}
      <div className="mt-6">
        {coursesLoading ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-white/10 bg-slate-950/60 py-20 text-slate-400">
            <FiLoader className="h-5 w-5 animate-spin" /> Loading your courses…
          </div>
        ) : coursesError ? (
          <div className="rounded-3xl border border-rose-400/20 bg-rose-500/5 py-16 text-center">
            <FiAlertTriangle className="mx-auto h-10 w-10 text-rose-400" />
            <p className="mt-4 text-lg font-semibold text-white">Couldn’t load your courses</p>
            <p className="mt-1 text-slate-400">{coursesError}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 py-20 text-center">
            <FiBookOpen className="mx-auto h-10 w-10 text-slate-600" />
            <p className="mt-4 text-lg font-semibold text-white">No courses here yet</p>
            <p className="mt-1 text-slate-400">
              {courses.length === 0
                ? "You haven't enrolled in any courses yet."
                : 'Try a different search term.'}
            </p>
            <Link
              href="/pages/courses"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-blue-500/40 hover:text-blue-200"
            >
              Browse courses <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
