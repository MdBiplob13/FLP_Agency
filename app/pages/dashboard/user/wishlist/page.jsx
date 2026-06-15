'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  FiHeart,
  FiLayers,
  FiClock,
  FiArrowRight,
  FiSearch,
  FiLoader,
  FiAlertTriangle,
  FiTrash2,
} from 'react-icons/fi';
import useWishlist from '@/hooks/course/wishlistHook';

const FALLBACK_IMG = '/image1.jpg';

/* ------------------------------------------------------------------ */
/*  Map a raw wishlisted-course doc into the shape the cards render    */
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

  // Resolve the display price from the tier (mirrors the public course cards).
  let price = c.price || 0;
  let oldPrice = null;
  let isFree = false;
  if (c.priceTier === 'free') {
    isFree = true;
    price = 0;
  } else if (c.priceTier === 'discounted' && c.discountPrice) {
    price = c.discountPrice;
    oldPrice = c.price || null;
  }

  return {
    id: c._id,
    title: c.title,
    category: c.category,
    img: c.thumbnail || FALLBACK_IMG,
    instructor: c.teachers?.[0]?.name || null,
    lessons,
    hours: Math.round(minutes / 60),
    price,
    oldPrice,
    isFree,
  };
}

/* ------------------------------------------------------------------ */
/*  Course card                                                       */
/* ------------------------------------------------------------------ */

function WishlistCard({ course, onRemove, removing }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 transition-colors hover:border-white/20">
      {/* Thumbnail */}
      <div className="relative h-40 w-full overflow-hidden">
        <Link href={`/pages/courses/${course.id}`}>
          <img
            src={course.img}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          {course.category}
        </span>
        {/* Remove from wishlist */}
        <button
          onClick={() => onRemove(course)}
          disabled={removing}
          aria-label="Remove from wishlist"
          className="absolute right-3 top-3 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-rose-400/30 bg-black/50 text-rose-300 backdrop-blur transition-colors hover:bg-rose-500/20 hover:text-rose-200 disabled:opacity-50"
        >
          {removing ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiHeart className="h-4 w-4 fill-rose-400" />}
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/pages/courses/${course.id}`}>
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-white transition-colors group-hover:text-blue-200">
            {course.title}
          </h3>
        </Link>
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

        {/* Price */}
        <div className="mt-4 flex items-baseline gap-2">
          {course.isFree ? (
            <span className="text-xl font-bold text-emerald-300">Free</span>
          ) : (
            <>
              <span className="text-xl font-bold text-white">৳{course.price}</span>
              {course.oldPrice ? (
                <span className="text-sm text-slate-500 line-through">৳{course.oldPrice}</span>
              ) : null}
            </>
          )}
        </div>

        {/* Action */}
        <div className="mt-5 border-t border-white/5 pt-4">
          <Link
            href={`/pages/courses/${course.id}`}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110"
          >
            View course <FiArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function WishlistPage() {
  const { courses: raw, coursesLoading, coursesError, toggle } = useWishlist();
  const [search, setSearch] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const courses = useMemo(() => (raw || []).map(normalize), [raw]);

  const filtered = useMemo(() => {
    if (!search.trim()) return courses;
    const q = search.toLowerCase();
    return courses.filter((c) =>
      `${c.title} ${c.category} ${c.instructor || ''}`.toLowerCase().includes(q),
    );
  }, [courses, search]);

  async function handleRemove(course) {
    setRemovingId(course.id);
    const result = await toggle(course.id);
    setRemovingId(null);
    if (result === false) toast.success('Removed from wishlist.');
    else if (result === null) toast.error('Could not update your wishlist.');
  }

  return (
    <div>
      {/* Header */}
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Saved for later</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">My wishlist</h1>
        <p className="mt-2 text-slate-400">Courses you’ve saved to come back to.</p>
      </div>

      {/* Search */}
      <div className="mt-8">
        <label className="relative block w-full sm:max-w-xs">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search my wishlist…"
            className="w-full rounded-full border border-white/10 bg-slate-900/80 py-3 pl-12 pr-4 text-sm text-white outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
          />
        </label>
      </div>

      {/* Grid / states */}
      <div className="mt-6">
        {coursesLoading ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-white/10 bg-slate-950/60 py-20 text-slate-400">
            <FiLoader className="h-5 w-5 animate-spin" /> Loading your wishlist…
          </div>
        ) : coursesError ? (
          <div className="rounded-3xl border border-rose-400/20 bg-rose-500/5 py-16 text-center">
            <FiAlertTriangle className="mx-auto h-10 w-10 text-rose-400" />
            <p className="mt-4 text-lg font-semibold text-white">Couldn’t load your wishlist</p>
            <p className="mt-1 text-slate-400">{coursesError}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 py-20 text-center">
            <FiHeart className="mx-auto h-10 w-10 text-slate-600" />
            <p className="mt-4 text-lg font-semibold text-white">Your wishlist is empty</p>
            <p className="mt-1 text-slate-400">
              {courses.length === 0
                ? 'Save courses you’re interested in to find them here later.'
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
              <WishlistCard
                key={c.id}
                course={c}
                onRemove={handleRemove}
                removing={removingId === c.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
