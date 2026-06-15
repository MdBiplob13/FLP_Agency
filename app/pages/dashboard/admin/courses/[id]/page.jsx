'use client';

// Single course management page. Replaces the cramped all-in-one admin courses
// screen: every per-course function lives in its own tab here.
//
// Tabs: Details · Edit · Content · Teachers · Wishlist.
// Data comes from useCourse(id) (full doc incl. curriculum, inWishlistOf, status,
// populated teachers). Each tab applies its mutation back via setCourse so the
// page stays in sync without a refetch.

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  FiArrowLeft,
  FiExternalLink,
  FiInfo,
  FiEdit2,
  FiLayers,
  FiUsers,
  FiHeart,
  FiAward,
  FiHome,
  FiLoader,
  FiCheck,
  FiTrash2,
  FiAlertTriangle,
  FiBookOpen,
  FiClock,
  FiPlayCircle,
  FiCalendar,
  FiSearch,
  FiUserPlus,
  FiUserX,
  FiUserCheck,
  FiEye,
  FiEyeOff,
  FiBell,
  FiSend,
  FiX,
} from 'react-icons/fi';
import { authHeaders } from '@/lib/clientAuth';
import { toLocalInput, toIsoOrNull } from '@/lib/datetime';
import useUser from '@/hooks/user/userHook';
import useCourse from '@/hooks/course/singleCourseHook';
import CourseForm, {
  EMPTY_FORM,
  MAX_FEATURED_COURSES,
} from '@/app/components/dashboard/CourseForm';
import {
  CurriculumEditor,
  ScheduleEditor,
} from '@/app/components/dashboard/CourseContentModal';

const statusStyles = {
  draft: 'text-amber-300 bg-amber-500/10 ring-amber-500/20',
  published: 'text-emerald-300 bg-emerald-500/10 ring-emerald-500/20',
  archived: 'text-slate-400 bg-slate-500/10 ring-slate-500/20',
};

const inputClass =
  'w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10';

const fmtDateTime = (v) =>
  v ? new Date(v).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

function priceDisplay(c) {
  if (c.priceTier === 'free') return { isFree: true };
  if (c.priceTier === 'discounted' && c.discountPrice) {
    return { price: c.discountPrice, oldPrice: c.price };
  }
  return { price: c.price || 0 };
}

function countLessons(curriculum = []) {
  let lessons = 0;
  let minutes = 0;
  for (const s of curriculum) {
    for (const l of s.lessons || []) {
      lessons += 1;
      minutes += l.duration || 0;
    }
  }
  return { lessons, hours: Math.round(minutes / 60) };
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

const TABS = [
  { key: 'details', label: 'Details', icon: FiInfo },
  { key: 'edit', label: 'Edit', icon: FiEdit2 },
  { key: 'content', label: 'Content', icon: FiLayers },
  { key: 'announcements', label: 'Announcements', icon: FiBell, adminOnly: true },
  { key: 'teachers', label: 'Teachers', icon: FiUsers },
  { key: 'wishlist', label: 'Wishlist', icon: FiHeart },
];

export default function CourseManagePage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useUser();
  const { course, courseLoading, courseError, setCourse } = useCourse(id);

  // Announcements are admin/superadmin only — teachers don't see the tab.
  const canAnnounce = ['admin', 'superadmin'].includes(user?.role);
  const tabs = useMemo(() => TABS.filter((t) => !t.adminOnly || canAnnounce), [canAnnounce]);

  const [tab, setTab] = useState('details');
  const [featuredCount, setFeaturedCount] = useState(0);

  // Count featured courses across all statuses (drives the homepage cap UI).
  async function loadFeaturedCount() {
    try {
      const res = await fetch('/api/courses?status=all&featured=true&limit=50', {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) setFeaturedCount((data.courses || []).length);
    } catch {
      /* non-critical */
    }
  }
  useEffect(() => {
    loadFeaturedCount();
  }, []);

  /* ---- Loading / error ---- */
  if (courseLoading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-3xl border border-white/10 bg-slate-950/60 py-24 text-slate-400">
        <FiLoader className="h-5 w-5 animate-spin" /> Loading course…
      </div>
    );
  }
  if (courseError || !course) {
    return (
      <div className="rounded-3xl border border-rose-400/20 bg-rose-500/5 py-16 text-center">
        <FiAlertTriangle className="mx-auto h-10 w-10 text-rose-400" />
        <p className="mt-4 text-lg font-semibold text-white">{courseError || 'Course not found'}</p>
        <Link
          href="/pages/dashboard/admin/courses"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-blue-500/40 hover:text-blue-200"
        >
          <FiArrowLeft className="h-4 w-4" /> Back to courses
        </Link>
      </div>
    );
  }

  const price = priceDisplay(course);

  return (
    <div>
      {/* Top bar */}
      <button
        onClick={() => router.push('/pages/dashboard/admin/courses')}
        className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-blue-500/40 hover:text-white"
      >
        <FiArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to courses
      </button>

      {/* Header */}
      <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-5 sm:flex-row sm:items-center">
        <div className="h-28 w-full flex-none overflow-hidden rounded-2xl bg-white/5 sm:w-44">
          {course.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <FiBookOpen className="h-8 w-8 text-slate-600" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="truncate">{course.category}</span>
            <span className="text-slate-600">·</span>
            <span className="capitalize">{course.level}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">{course.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${statusStyles[course.status] || statusStyles.draft}`}
            >
              {course.status}
            </span>
            {price.isFree ? (
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-200 ring-1 ring-emerald-400/30">Free</span>
            ) : (
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/10">
                ৳{price.price}
                {price.oldPrice ? <span className="ml-1.5 text-slate-500 line-through">৳{price.oldPrice}</span> : null}
              </span>
            )}
            {course.isBestseller && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300 ring-1 ring-amber-400/30">
                <FiAward className="h-3 w-3" /> Bestseller
              </span>
            )}
            {course.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-300 ring-1 ring-blue-400/30">
                <FiHome className="h-3 w-3" /> Homepage
              </span>
            )}
            {course.isHidden && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/15 px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-slate-400/30">
                <FiEyeOff className="h-3 w-3" /> Hidden
              </span>
            )}
          </div>
        </div>
        <Link
          href={`/pages/courses/${course._id}`}
          target="_blank"
          className="inline-flex flex-none cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-blue-500/40 hover:text-blue-200"
        >
          <FiExternalLink className="h-4 w-4" /> View live
        </Link>
      </div>

      {/* Tab navbar — box buttons, active gets a thick bottom border */}
      <div className="mt-8 flex gap-1 overflow-x-auto border-b border-white/10">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 px-5 py-3.5 text-sm font-semibold transition-colors ${
                active
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      <div className="mt-8">
        {tab === 'details' && (
          <DetailsTab
            course={course}
            setCourse={setCourse}
            featuredCount={featuredCount}
            reloadFeaturedCount={loadFeaturedCount}
            onDeleted={() => router.push('/pages/dashboard/admin/courses')}
          />
        )}
        {tab === 'edit' && (
          <EditTab course={course} setCourse={setCourse} featuredCount={featuredCount} reloadFeaturedCount={loadFeaturedCount} />
        )}
        {tab === 'content' && <ContentTab course={course} setCourse={setCourse} />}
        {tab === 'announcements' && canAnnounce && <AnnouncementsTab course={course} />}
        {tab === 'teachers' && <TeachersTab course={course} setCourse={setCourse} />}
        {tab === 'wishlist' && <WishlistTab courseId={course._id} />}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Details tab                                                        */
/* ================================================================== */

function DetailsTab({ course, setCourse, featuredCount, reloadFeaturedCount, onDeleted }) {
  const [togglingField, setTogglingField] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { lessons, hours } = useMemo(() => countLessons(course.curriculum), [course.curriculum]);

  async function toggleFlag(field) {
    const next = !course[field];
    if (field === 'isFeatured' && next && featuredCount >= MAX_FEATURED_COURSES) {
      toast.error(`You can feature at most ${MAX_FEATURED_COURSES} courses on the homepage.`);
      return;
    }
    // A hidden course can't also be a bestseller or pinned to the homepage.
    if (field === 'isHidden' && next && (course.isBestseller || course.isFeatured)) {
      toast.error('Remove the bestseller / homepage flags before hiding this course.');
      return;
    }
    setTogglingField(field);
    setCourse((prev) => ({ ...prev, [field]: next })); // optimistic
    try {
      const res = await fetch(`/api/courses/${course._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ [field]: next }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setCourse((prev) => ({ ...prev, [field]: !next })); // roll back
        toast.error(data.message || 'Failed to update course.');
        return;
      }
      if (field === 'isFeatured') reloadFeaturedCount();
      toast.success('Course updated.');
    } catch {
      setCourse((prev) => ({ ...prev, [field]: !next }));
      toast.error('Network error while updating.');
    } finally {
      setTogglingField(null);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/courses/${course._id}`, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to delete course.');
        return;
      }
      toast.success('Course deleted.');
      onDeleted();
    } catch {
      toast.error('Network error while deleting.');
    } finally {
      setDeleting(false);
    }
  }

  const stats = [
    { label: 'Students', value: course.studentsEnrolled?.length || 0, icon: FiUsers },
    { label: 'Wishlisted', value: course.inWishlistOf?.length || 0, icon: FiHeart },
    { label: 'Lessons', value: lessons, icon: FiPlayCircle },
    { label: 'Hours', value: hours, icon: FiClock },
  ];

  return (
    <div className="space-y-8">
      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300 ring-1 ring-white/10">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-2xl font-bold text-white">{s.value}</span>
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Overview */}
      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <FiBookOpen className="h-5 w-5 text-blue-300" /> About
        </h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-300">{course.description}</p>
        {(course.tags || []).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {course.tags.map((t) => (
              <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">#{t}</span>
            ))}
          </div>
        )}
        <dl className="mt-6 grid gap-4 border-t border-white/5 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Language', course.language || '—'],
            ['Level', course.level],
            ['Enroll opens', fmtDateTime(course.enrollStartDate)],
            ['Enroll closes', fmtDateTime(course.enrollEndDate)],
            ['Course starts', fmtDateTime(course.courseStartDate)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</dt>
              <dd className="mt-1 text-sm capitalize text-slate-200">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Marketing flags */}
      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
        <h2 className="text-lg font-bold text-white">Marketing</h2>
        <p className="mt-1 text-sm text-slate-400">
          Homepage spots used: <span className="font-semibold text-slate-300">{featuredCount}/{MAX_FEATURED_COURSES}</span>
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => toggleFlag('isBestseller')}
            disabled={togglingField === 'isBestseller'}
            className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
              course.isBestseller
                ? 'border-amber-400/30 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                : 'cursor-pointer border-white/10 bg-white/5 text-slate-300 hover:text-amber-200'
            }`}
          >
            {togglingField === 'isBestseller' ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiAward className="h-4 w-4" />}
            {course.isBestseller ? 'Bestseller ✓' : 'Mark as bestseller'}
          </button>
          <button
            onClick={() => toggleFlag('isFeatured')}
            disabled={togglingField === 'isFeatured' || (!course.isFeatured && featuredCount >= MAX_FEATURED_COURSES)}
            className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              course.isFeatured
                ? 'cursor-pointer border-blue-400/30 bg-blue-500/15 text-blue-300 hover:bg-blue-500/25'
                : 'cursor-pointer border-white/10 bg-white/5 text-slate-300 hover:text-blue-200'
            }`}
          >
            {togglingField === 'isFeatured' ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiHome className="h-4 w-4" />}
            {course.isFeatured ? 'On homepage ✓' : 'Show on homepage'}
          </button>
        </div>
      </section>

      {/* Visibility */}
      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          {course.isHidden ? <FiEyeOff className="h-5 w-5 text-slate-300" /> : <FiEye className="h-5 w-5 text-emerald-300" />}
          Visibility
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
          {course.isHidden
            ? 'This course is hidden from the public catalogue and homepage. Already-enrolled students and managers keep full access — you just can’t sell it to new students.'
            : 'This course is visible in the public catalogue and may appear on the homepage. Hide it to stop new enrollments while keeping access for students who already bought it.'}
        </p>
        <button
          onClick={() => toggleFlag('isHidden')}
          disabled={togglingField === 'isHidden' || (!course.isHidden && (course.isBestseller || course.isFeatured))}
          title={
            !course.isHidden && (course.isBestseller || course.isFeatured)
              ? 'Remove the bestseller / homepage flags before hiding this course.'
              : undefined
          }
          className={`mt-4 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            course.isHidden
              ? 'cursor-pointer border-emerald-400/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
              : 'cursor-pointer border-white/10 bg-white/5 text-slate-300 hover:text-white'
          }`}
        >
          {togglingField === 'isHidden' ? (
            <FiLoader className="h-4 w-4 animate-spin" />
          ) : course.isHidden ? (
            <FiEye className="h-4 w-4" />
          ) : (
            <FiEyeOff className="h-4 w-4" />
          )}
          {course.isHidden ? 'Make visible' : 'Hide from public'}
        </button>
        {!course.isHidden && (course.isBestseller || course.isFeatured) && (
          <p className="mt-3 text-xs text-amber-300/80">
            Remove the bestseller / homepage flags above before you can hide this course.
          </p>
        )}
      </section>

      {/* Danger zone */}
      <section className="rounded-3xl border border-red-400/20 bg-red-500/5 p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <FiAlertTriangle className="h-5 w-5 text-red-400" /> Danger zone
        </h2>
        <p className="mt-1 text-sm text-slate-400">Deleting a course is permanent and cannot be undone.</p>
        <button
          onClick={() => setShowDelete(true)}
          className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/20"
        >
          <FiTrash2 className="h-4 w-4" /> Delete course
        </button>
      </section>

      {/* Delete confirmation */}
      {showDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a12] p-7 shadow-2xl shadow-black/50">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-red-500/15 text-red-300 ring-1 ring-red-400/20">
                <FiAlertTriangle className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete course?</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  “{course.title}” will be permanently removed. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="cursor-pointer rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:text-blue-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deleting && <FiLoader className="h-4 w-4 animate-spin" />}
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Edit tab                                                           */
/* ================================================================== */

function formFromCourse(c) {
  return {
    title: c.title || '',
    description: c.description || '',
    category: c.category || '',
    priceTier: c.priceTier || 'paid',
    price: c.price ?? 0,
    discountPrice: c.discountPrice ?? 0,
    level: c.level || 'beginner',
    language: c.language || 'Bangla',
    tags: Array.isArray(c.tags) ? c.tags.join(', ') : '',
    thumbnail: c.thumbnail || '',
    enrollStartDate: toLocalInput(c.enrollStartDate),
    enrollEndDate: toLocalInput(c.enrollEndDate),
    courseStartDate: toLocalInput(c.courseStartDate),
    status: c.status || 'draft',
    isBestseller: !!c.isBestseller,
    isFeatured: !!c.isFeatured,
  };
}

function EditTab({ course, setCourse, featuredCount, reloadFeaturedCount }) {
  const [form, setForm] = useState(() => formFromCourse(course));
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  // Re-sync the form when the underlying course changes (e.g. after a save).
  useEffect(() => {
    setForm(formFromCourse(course));
  }, [course]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/categories?withCounts=true', { headers: authHeaders() });
        const data = await res.json();
        if (res.ok && data.success) setCategories(data.categories || []);
      } catch {
        /* suggestions are non-critical */
      }
    })();
  }, []);

  function handleField(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.category.trim()) {
      toast.error('Title, description and category are required.');
      return;
    }
    if (form.description.trim().length < 10) {
      toast.error('Description must be at least 10 characters.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        discountPrice: Number(form.discountPrice) || 0,
        enrollStartDate: toIsoOrNull(form.enrollStartDate),
        enrollEndDate: toIsoOrNull(form.enrollEndDate),
        courseStartDate: toIsoOrNull(form.courseStartDate),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      const res = await fetch(`/api/courses/${course._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to save course.');
        return;
      }
      // PATCH returns teachers as ids — keep the populated teachers we already have.
      setCourse((prev) => ({ ...data.course, teachers: prev.teachers }));
      reloadFeaturedCount();
      toast.success('Course updated.');
    } catch {
      toast.error('Network error while saving.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
      <CourseForm
        form={form}
        onField={handleField}
        setForm={setForm}
        categories={categories}
        featuredCount={featuredCount}
        editing
      />
      <div className="mt-6 flex items-center justify-end border-t border-white/10 pt-5">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiCheck className="h-4 w-4" />}
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

/* ================================================================== */
/*  Content tab                                                        */
/* ================================================================== */

function ContentTab({ course, setCourse }) {
  // Content routes return teachers as raw ids; keep the populated objects.
  const apply = (updated) => setCourse((prev) => ({ ...updated, teachers: prev.teachers }));

  const lessonCount = useMemo(
    () => (course.curriculum || []).reduce((n, s) => n + (s.lessons?.length || 0), 0),
    [course.curriculum],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
        <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-white">
          <FiLayers className="h-5 w-5 text-blue-300" /> Curriculum
        </h2>
        <CurriculumEditor courseId={course._id} sections={course.curriculum || []} apply={apply} lessonCount={lessonCount} />
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
        <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-white">
          <FiCalendar className="h-5 w-5 text-blue-300" /> Schedule
        </h2>
        <ScheduleEditor courseId={course._id} schedule={course.schedule || []} apply={apply} />
      </section>
    </div>
  );
}

/* ================================================================== */
/*  Teachers tab                                                       */
/* ================================================================== */

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}

function Avatar({ person, className = '' }) {
  if (person.photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={person.photo} alt={person.name} className={`h-10 w-10 flex-none rounded-full object-cover ring-2 ring-white/10 ${className}`} />;
  }
  return (
    <span className={`flex h-10 w-10 flex-none items-center justify-center rounded-full bg-blue-500/15 text-xs font-semibold text-blue-200 ring-2 ring-white/10 ${className}`}>
      {initials(person.name) || '?'}
    </span>
  );
}

function TeachersTab({ course, setCourse }) {
  const [allTeachers, setAllTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState(null);

  const assigned = course.teachers || [];

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/teachers?limit=100', { headers: authHeaders() });
        const data = await res.json();
        if (res.ok && data.success) setAllTeachers(data.teachers || []);
        else toast.error(data.message || 'Failed to load teachers.');
      } catch {
        toast.error('Network error while loading teachers.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const available = useMemo(() => {
    const assignedIds = new Set(assigned.map((t) => t._id));
    const q = search.trim().toLowerCase();
    return allTeachers.filter((t) => !assignedIds.has(t._id) && (!q || t.name?.toLowerCase().includes(q)));
  }, [allTeachers, assigned, search]);

  async function saveTeachers(nextTeachers, savingIdValue) {
    setSavingId(savingIdValue);
    const prev = assigned;
    setCourse((p) => ({ ...p, teachers: nextTeachers })); // optimistic
    try {
      const res = await fetch(`/api/courses/${course._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ teachers: nextTeachers.map((t) => t._id) }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setCourse((p) => ({ ...p, teachers: prev }));
        toast.error(data.message || 'Failed to update teachers.');
        return false;
      }
      return true;
    } catch {
      setCourse((p) => ({ ...p, teachers: prev }));
      toast.error('Network error while updating teachers.');
      return false;
    } finally {
      setSavingId(null);
    }
  }

  async function assign(teacher) {
    if (await saveTeachers([...assigned, teacher], teacher._id)) toast.success(`${teacher.name} assigned.`);
  }
  async function remove(teacher) {
    if (await saveTeachers(assigned.filter((t) => t._id !== teacher._id), teacher._id)) toast.success(`${teacher.name} removed.`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Assigned */}
      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          <FiUserCheck className="h-4 w-4 text-emerald-300" /> Assigned
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-slate-300">{assigned.length}</span>
        </p>
        {assigned.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-slate-500">
            No teachers assigned yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {assigned.map((t) => (
              <li key={t._id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar person={t} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{t.name}</p>
                    <p className="truncate text-xs capitalize text-slate-500">{t.role || 'teacher'}</p>
                  </div>
                </div>
                <button
                  onClick={() => remove(t)}
                  disabled={savingId === t._id}
                  className="inline-flex flex-none cursor-pointer items-center gap-1.5 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-60"
                >
                  {savingId === t._id ? <FiLoader className="h-3.5 w-3.5 animate-spin" /> : <FiUserX className="h-3.5 w-3.5" />}
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Add */}
      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          <FiUserPlus className="h-4 w-4 text-blue-300" /> Add a teacher
        </p>
        <label className="relative mt-4 block">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teachers…"
            className="w-full rounded-full border border-white/10 bg-slate-900/80 py-2.5 pl-11 pr-4 text-sm text-white outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
          />
        </label>
        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-400">
              <FiLoader className="h-4 w-4 animate-spin" /> Loading teachers…
            </div>
          ) : available.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-slate-500">
              {allTeachers.length === 0 ? 'No active teachers found.' : 'All matching teachers are already assigned.'}
            </p>
          ) : (
            <ul className="space-y-2">
              {available.map((t) => (
                <li key={t._id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar person={t} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{t.name}</p>
                      {t.address ? <p className="truncate text-xs text-slate-500">{t.address}</p> : null}
                    </div>
                  </div>
                  <button
                    onClick={() => assign(t)}
                    disabled={savingId === t._id}
                    className="inline-flex flex-none cursor-pointer items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/15 px-3 py-1.5 text-xs font-semibold text-blue-200 transition-colors hover:bg-blue-500/25 disabled:opacity-60"
                  >
                    {savingId === t._id ? <FiLoader className="h-3.5 w-3.5 animate-spin" /> : <FiUserPlus className="h-3.5 w-3.5" />}
                    Assign
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

/* ================================================================== */
/*  Announcements tab                                                  */
/* ================================================================== */

function fmtDateTimeFull(v) {
  return v
    ? new Date(v).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : '';
}

function AnnouncementsTab({ course }) {
  const [form, setForm] = useState({ title: '', body: '' });
  const [sending, setSending] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentCount = course.studentsEnrolled?.length || 0;

  // Load the announcement history for this course.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/courses/${course._id}/announce`, { headers: authHeaders() });
        const data = await res.json();
        if (!cancelled) {
          if (res.ok && data.success) setAnnouncements(data.announcements || []);
          else toast.error(data.message || 'Failed to load announcements.');
        }
      } catch {
        if (!cancelled) toast.error('Network error while loading announcements.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [course._id]);

  async function send(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('An announcement title is required.');
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`/api/courses/${course._id}/announce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ title: form.title.trim(), body: form.body.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to send announcement.');
        return;
      }
      toast.success(data.message || 'Announcement sent.');
      setForm({ title: '', body: '' });
      if (data.announcement) setAnnouncements((prev) => [data.announcement, ...prev]);
    } catch {
      toast.error('Network error while sending announcement.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Composer */}
      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <FiBell className="h-5 w-5 text-purple-300" /> Send an announcement
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Notifies all{' '}
          <span className="font-semibold text-slate-200">{studentCount}</span> enrolled
          {studentCount === 1 ? ' student' : ' students'} in their notifications.
        </p>

        <form onSubmit={send} className="mt-5 space-y-4">
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Announcement title (e.g. Class rescheduled to Friday)"
            className={inputClass}
          />
          <textarea
            value={form.body}
            onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
            placeholder="Write the details students should see… (optional)"
            rows={4}
            className={`${inputClass} resize-y`}
          />
          <div className="flex items-center justify-between gap-3">
            {studentCount === 0 ? (
              <p className="text-xs text-amber-300/80">
                No students are enrolled yet — this will be saved but reaches no one.
              </p>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={sending || !form.title.trim()}
              className="inline-flex flex-none cursor-pointer items-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiSend className="h-4 w-4" />}
              {sending ? 'Sending…' : 'Send announcement'}
            </button>
          </div>
        </form>
      </section>

      {/* History */}
      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Sent announcements
        </h3>
        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
              <FiLoader className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : announcements.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-10 text-center text-sm text-slate-500">
              No announcements sent yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {announcements.map((a) => (
                <li key={a._id} className="rounded-2xl border border-white/10 bg-slate-900/60 px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-white">{a.title}</p>
                    <span className="flex-none text-xs text-slate-500">{fmtDateTimeFull(a.createdAt)}</span>
                  </div>
                  {a.body && <p className="mt-1.5 whitespace-pre-line text-sm text-slate-400">{a.body}</p>}
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <FiUsers className="h-3.5 w-3.5" /> Sent to {a.recipientCount}{' '}
                    {a.recipientCount === 1 ? 'student' : 'students'}
                    {a.sentBy?.name ? ` · by ${a.sentBy.name}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

/* ================================================================== */
/*  Wishlist tab                                                       */
/* ================================================================== */

function WishlistTab({ courseId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/courses/${courseId}/wishlist`, { headers: authHeaders() });
        const data = await res.json();
        if (res.ok && data.success) setUsers(data.users || []);
        else toast.error(data.message || 'Failed to load wishlist.');
      } catch {
        toast.error('Network error while loading wishlist.');
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-white">
        <FiHeart className="h-5 w-5 text-rose-300" /> Wishlisted by
        {!loading && (
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-sm font-semibold text-slate-300">{users.length}</span>
        )}
      </h2>

      <div className="mt-5">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
            <FiLoader className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : users.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-10 text-center text-sm text-slate-500">
            No one has added this course to their wishlist yet.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {users.map((u) => (
              <li key={u._id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar person={u} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{u.name}</p>
                    <p className="truncate text-xs text-slate-500">{u.email}</p>
                  </div>
                </div>
                <span className="flex-none rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-400 ring-1 ring-white/10">
                  {u.role || 'user'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
