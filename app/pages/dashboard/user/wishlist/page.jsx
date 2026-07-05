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
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-surface transition-colors hover:border-border-strong">
      {/* Thumbnail */}
      <div className="relative h-40 w-full overflow-hidden">
        <Link href={`/pages/courses/${course.slug || course.id}`}>
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
          className="absolute right-3 top-3 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-rose-400/30 bg-black/50 text-danger backdrop-blur transition-colors hover:bg-rose-500/20 hover:text-rose-200 disabled:opacity-50"
        >
          {removing ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiHeart className="h-4 w-4 fill-rose-400" />}
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/pages/courses/${course.slug || course.id}`}>
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-text transition-colors group-hover:text-primary">
            {course.title}
          </h3>
        </Link>
        {course.instructor && <p className="mt-1 text-xs text-text-muted">by {course.instructor}</p>}

        {/* Meta */}
        <div className="mt-4 flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <FiLayers className="h-3.5 w-3.5 text-primary" /> {course.lessons} lessons
          </span>
          <span className="flex items-center gap-1.5">
            <FiClock className="h-3.5 w-3.5 text-primary" /> {course.hours}h
          </span>
        </div>

        {/* Price */}
        <div className="mt-4 flex items-baseline gap-2">
          {course.isFree ? (
            <span className="text-xl font-bold text-success">Free</span>
          ) : (
            <>
              <span className="text-xl font-bold text-text">৳{course.price}</span>
              {course.oldPrice ? (
                <span className="text-sm text-text-subtle line-through">৳{course.oldPrice}</span>
              ) : null}
            </>
          )}
        </div>

        {/* Action */}
        <div className="mt-5 border-t border-border pt-4">
          <Link
            href={`/pages/courses/${course.slug || course.id}`}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-linear-to-r from-primary to-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:brightness-110"
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
        <p className="text-sm uppercase tracking-[0.35em] text-primary">Saved for later</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-text">My wishlist</h1>
        <p className="mt-2 text-text-muted">Courses you’ve saved to come back to.</p>
      </div>

      {/* Search */}
      <div className="mt-8">
        <label className="relative block w-full sm:max-w-xs">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-subtle" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search my wishlist…"
            className="w-full rounded-full border border-border bg-surface-elevated/80 py-3 pl-12 pr-4 text-sm text-text outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
          />
        </label>
      </div>

      {/* Grid / states */}
      <div className="mt-6">
        {coursesLoading ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-border bg-surface py-20 text-text-muted">
            <FiLoader className="h-5 w-5 animate-spin" /> Loading your wishlist…
          </div>
        ) : coursesError ? (
          <div className="rounded-3xl border border-rose-400/20 bg-rose-500/5 py-16 text-center">
            <FiAlertTriangle className="mx-auto h-10 w-10 text-danger" />
            <p className="mt-4 text-lg font-semibold text-text">Couldn’t load your wishlist</p>
            <p className="mt-1 text-text-muted">{coursesError}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-border bg-surface py-20 text-center">
            <FiHeart className="mx-auto h-10 w-10 text-text-subtle" />
            <p className="mt-4 text-lg font-semibold text-text">Your wishlist is empty</p>
            <p className="mt-1 text-text-muted">
              {courses.length === 0
                ? 'Save courses you’re interested in to find them here later.'
                : 'Try a different search term.'}
            </p>
            <Link
              href="/pages/courses"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface-muted px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:border-primary/40 hover:text-primary"
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
