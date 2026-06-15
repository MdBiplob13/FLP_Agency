'use client';

// Video player / learning page for an enrolled course.
//
// The course is sourced from the learner's enrolled list (useMyCourses), which
// doubles as the access gate: a course only appears there if the user actually
// bought it, so a non-enrolled / unknown id falls through to the "no access"
// state. Lesson videos are whatever the admin stored (YouTube / Vimeo / a direct
// file), normalised by resolveVideo().

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FiArrowLeft,
  FiArrowRight,
  FiPlay,
  FiCheck,
  FiCheckCircle,
  FiPlayCircle,
  FiChevronDown,
  FiClock,
  FiLayers,
  FiBookOpen,
  FiAward,
  FiVideoOff,
  FiLoader,
  FiLock,
} from 'react-icons/fi';
import useMyCourses from '@/hooks/course/myCoursesHook';
import { resolveVideo } from '@/lib/courseVideo';
import CoursePlayer from '@/app/components/course/CoursePlayer.jsx';

const FALLBACK_IMG = '/image1.jpg';
const fmtMin = (m) => (m ? `${m} min` : '—');

/* ------------------------------------------------------------------ */
/*  Video surface — custom player, or a "no video" placeholder         */
/* ------------------------------------------------------------------ */

function VideoSurface({ lesson, poster }) {
  const video = resolveVideo(lesson?.videoUrl);

  if (video.kind === 'none') {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-3xl border border-white/10 bg-black text-center">
        <FiVideoOff className="h-10 w-10 text-slate-600" />
        <p className="text-sm font-semibold text-white">No video for this lesson yet</p>
        <p className="max-w-xs text-xs text-slate-500">
          The instructor hasn’t uploaded a video for “{lesson?.title}”. Check another lesson.
        </p>
      </div>
    );
  }

  // `key` forces a fresh player instance whenever the lesson changes.
  return <CoursePlayer key={lesson?._id} video={video} poster={poster} title={lesson?.title} />;
}

/* ------------------------------------------------------------------ */
/*  Curriculum sidebar                                                 */
/* ------------------------------------------------------------------ */

function LessonRow({ lesson, active, done, playable, onSelect }) {
  const Icon = done ? FiCheckCircle : active ? FiPlayCircle : playable ? FiPlay : FiLock;
  return (
    <button
      type="button"
      onClick={() => onSelect?.(lesson)}
      className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors ${
        active ? 'bg-linear-to-r from-blue-600/20 to-purple-600/10' : 'hover:bg-white/5'
      }`}
    >
      <Icon
        className={`h-4 w-4 flex-none ${
          done ? 'text-emerald-400' : active ? 'text-blue-300' : 'text-slate-500'
        }`}
      />
      <span
        className={`min-w-0 flex-1 truncate text-sm ${
          active ? 'font-semibold text-white' : 'text-slate-300'
        }`}
      >
        {lesson.title}
      </span>
      {lesson.isPreview && (
        <span className="flex-none rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-300">
          Preview
        </span>
      )}
      <span className="flex-none text-xs text-slate-500">{fmtMin(lesson.duration)}</span>
    </button>
  );
}

function Section({ section, index, openByDefault, activeId, completed, onSelect }) {
  const [open, setOpen] = useState(openByDefault);
  const lessons = section.lessons || [];
  const total = lessons.length;
  const done = lessons.filter((l) => completed.has(l._id)).length;

  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 bg-white/[0.02] px-4 py-3.5 text-left transition-colors hover:bg-white/5"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            <span className="text-blue-300">{String(index + 1).padStart(2, '0')}.</span>{' '}
            {section.title}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {done}/{total} lessons
          </p>
        </div>
        <FiChevronDown
          className={`h-4 w-4 flex-none text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="divide-y divide-white/5">
          {lessons.map((lesson) => (
            <LessonRow
              key={lesson._id}
              lesson={lesson}
              active={lesson._id === activeId}
              done={completed.has(lesson._id)}
              playable={!!(lesson.videoUrl || '').trim()}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function LearnPage() {
  const { id } = useParams();
  const { courses, coursesLoading, coursesError } = useMyCourses();

  // The enrolled course matching the route id (also the access gate).
  const course = useMemo(
    () => (courses || []).find((c) => String(c._id) === String(id)) || null,
    [courses, id],
  );

  const curriculum = course?.curriculum || [];

  // Flatten lessons so we can resolve the active one + prev/next navigation.
  const flatLessons = useMemo(
    () => curriculum.flatMap((s) => s.lessons || []),
    [curriculum],
  );

  const [activeId, setActiveId] = useState(null);
  // Completed lessons — tracked client-side for the session (no progress API yet).
  const [completed, setCompleted] = useState(() => new Set());

  // Default to the first lesson once the course loads.
  useEffect(() => {
    if (!activeId && flatLessons.length) setActiveId(flatLessons[0]._id);
  }, [flatLessons, activeId]);

  const active = flatLessons.find((l) => l._id === activeId) || null;
  const activeIndex = flatLessons.findIndex((l) => l._id === activeId);
  const prev = activeIndex > 0 ? flatLessons[activeIndex - 1] : null;
  const next =
    activeIndex >= 0 && activeIndex < flatLessons.length - 1
      ? flatLessons[activeIndex + 1]
      : null;

  const totalLessons = flatLessons.length;
  const doneCount = completed.size;
  const progress = totalLessons ? Math.round((doneCount / totalLessons) * 100) : 0;

  function selectLesson(lesson) {
    setActiveId(lesson._id);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleComplete(lessonId) {
    setCompleted((prevSet) => {
      const nextSet = new Set(prevSet);
      if (nextSet.has(lessonId)) nextSet.delete(lessonId);
      else nextSet.add(lessonId);
      return nextSet;
    });
  }

  /* ---- Loading ---- */
  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-3xl border border-white/10 bg-slate-950/60 py-24 text-slate-400">
        <FiLoader className="h-5 w-5 animate-spin" /> Loading your course…
      </div>
    );
  }

  /* ---- No access / not found ---- */
  if (coursesError || !course) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-950/60 py-20 text-center">
        <FiLock className="mx-auto h-10 w-10 text-slate-600" />
        <p className="mt-4 text-lg font-semibold text-white">
          {coursesError ? 'Couldn’t load this course' : 'You don’t have access to this course'}
        </p>
        <p className="mt-1 text-slate-400">
          {coursesError || 'Enroll in the course to start watching its lessons.'}
        </p>
        <Link
          href="/pages/dashboard/user"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-blue-500/40 hover:text-blue-200"
        >
          <FiArrowLeft className="h-4 w-4" /> Back to My Courses
        </Link>
      </div>
    );
  }

  const instructor = course.teachers?.[0]?.name || null;
  const poster = course.thumbnail || FALLBACK_IMG;

  return (
    <div>
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/pages/dashboard/user"
          className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-blue-500/40 hover:text-white"
        >
          <FiArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to My Courses
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Progress</p>
            <p className="text-sm font-semibold text-white">
              {doneCount}/{totalLessons} lessons · {progress}%
            </p>
          </div>
          <div className="relative h-11 w-11">
            <svg viewBox="0 0 36 36" className="h-11 w-11 -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="url(#g)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(progress / 100) * 97.4} 97.4`}
              />
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
              {progress}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* ============ LEFT: player + details ============ */}
        <div className="space-y-6">
          <VideoSurface lesson={active} poster={poster} />

          {/* Lesson heading */}
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-300">{course.category}</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {active?.title || course.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <FiBookOpen className="h-4 w-4 text-blue-300" /> {course.title}
              </span>
              {active?.duration ? (
                <span className="flex items-center gap-1.5">
                  <FiClock className="h-4 w-4 text-blue-300" /> {fmtMin(active.duration)}
                </span>
              ) : null}
              {instructor && (
                <span className="flex items-center gap-1.5">
                  <FiAward className="h-4 w-4 text-blue-300" /> by {instructor}
                </span>
              )}
            </div>
          </div>

          {/* Prev / next + mark complete */}
          {totalLessons > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-y border-white/5 py-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!prev}
                  onClick={() => prev && selectLesson(prev)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-blue-500/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FiArrowLeft className="h-4 w-4" /> Previous
                </button>
                <button
                  type="button"
                  disabled={!next}
                  onClick={() => next && selectLesson(next)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-blue-500/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next <FiArrowRight className="h-4 w-4" />
                </button>
              </div>
              {active && (
                <button
                  type="button"
                  onClick={() => toggleComplete(active._id)}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 ${
                    completed.has(active._id)
                      ? 'bg-linear-to-r from-slate-600 to-slate-700 shadow-black/20'
                      : 'bg-linear-to-r from-emerald-600 to-teal-600 shadow-emerald-600/25'
                  }`}
                >
                  <FiCheck className="h-4 w-4" />
                  {completed.has(active._id) ? 'Completed' : 'Mark as complete'}
                </button>
              )}
            </div>
          )}

          {/* About */}
          {course.description && (
            <section>
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <FiBookOpen className="h-5 w-5 text-blue-300" /> About this course
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-300">
                {course.description}
              </p>
            </section>
          )}
        </div>

        {/* ============ RIGHT: curriculum ============ */}
        <aside className="xl:sticky xl:top-8 xl:h-fit">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="flex items-center gap-2 text-base font-bold text-white">
                <FiLayers className="h-4.5 w-4.5 text-blue-300" /> Course content
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {curriculum.length} sections · {totalLessons} lessons
              </p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-linear-to-r from-blue-500 to-purple-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              {curriculum.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-slate-500">
                  No lessons have been added to this course yet.
                </p>
              ) : (
                curriculum.map((section, i) => (
                  <Section
                    key={section._id || i}
                    section={section}
                    index={i}
                    openByDefault={(section.lessons || []).some((l) => l._id === activeId) || i === 0}
                    activeId={activeId}
                    completed={completed}
                    onSelect={selectLesson}
                  />
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
