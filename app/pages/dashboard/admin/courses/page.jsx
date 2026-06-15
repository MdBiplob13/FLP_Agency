'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  FiPlus,
  FiTrash2,
  FiX,
  FiBookOpen,
  FiUsers,
  FiHeart,
  FiCheckCircle,
  FiSearch,
  FiLoader,
  FiAlertTriangle,
  FiAward,
  FiHome,
  FiEye,
  FiEyeOff,
  FiSettings,
} from 'react-icons/fi';
import { authHeaders } from '@/lib/clientAuth';
import { toIsoOrNull } from '@/lib/datetime';
import CourseForm, {
  EMPTY_FORM,
  MAX_FEATURED_COURSES,
} from '@/app/components/dashboard/CourseForm';

const statusStyles = {
  draft: 'text-amber-300 bg-amber-500/10 ring-amber-500/20',
  published: 'text-emerald-300 bg-emerald-500/10 ring-emerald-500/20',
  archived: 'text-slate-400 bg-slate-500/10 ring-slate-500/20',
};

const STATUSES = ['draft', 'published', 'archived'];

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Create modal (per-course editing lives on the /courses/[id] page)
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Inline bestseller / featured toggles — tracks which course+flag is saving
  const [togglingKey, setTogglingKey] = useState(null);

  /* ---- Load courses (admin view includes drafts) ---- */
  async function loadCourses() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: statusFilter, limit: '50' });
      const res = await fetch(`/api/courses?${params.toString()}`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        setCourses(data.courses || []);
      } else {
        toast.error(data.message || 'Failed to load courses.');
      }
    } catch {
      toast.error('Network error while loading courses.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Load categories once for the autocomplete suggestions
  async function loadCategories() {
    try {
      const res = await fetch('/api/categories?withCounts=true', { headers: authHeaders() });
      const data = await res.json();
      if (res.ok && data.success) setCategories(data.categories || []);
    } catch {
      // suggestions are non-critical; ignore failures
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  /* ---- Derived: client-side search + stats ---- */
  const filtered = useMemo(() => {
    if (!search.trim()) return courses;
    const q = search.toLowerCase();
    return courses.filter(
      (c) => c.title?.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q)
    );
  }, [courses, search]);

  // How many courses are currently pinned to the homepage
  const featuredCount = useMemo(
    () => courses.filter((c) => c.isFeatured).length,
    [courses]
  );

  const stats = useMemo(() => {
    const published = courses.filter((c) => c.status === 'published').length;
    const students = courses.reduce((sum, c) => sum + (c.studentsEnrolled?.length || 0), 0);
    const wishlisted = courses.reduce((sum, c) => sum + (c.inWishlistOf?.length || 0), 0);
    return [
      { label: 'Total courses', value: courses.length, icon: FiBookOpen },
      { label: 'Published', value: published, icon: FiCheckCircle },
      { label: 'Enrollments', value: students, icon: FiUsers },
      { label: 'Wishlisted', value: wishlisted, icon: FiHeart },
    ];
  }, [courses]);

  /* ---- Create modal helpers ---- */
  function openCreate() {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

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
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to save course.');
        return;
      }

      toast.success('Course created.');
      setModalOpen(false);
      loadCourses();
      loadCategories();
    } catch {
      toast.error('Network error while saving.');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/courses/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to delete course.');
        return;
      }
      toast.success('Course deleted.');
      setDeleteTarget(null);
      loadCourses();
    } catch {
      toast.error('Network error while deleting.');
    } finally {
      setDeleting(false);
    }
  }

  /* ---- Inline bestseller / featured toggle ---- */
  async function toggleFlag(course, field) {
    const next = !course[field];

    // Enforce the homepage cap before we even hit the network
    if (field === 'isFeatured' && next && featuredCount >= MAX_FEATURED_COURSES) {
      toast.error(`You can feature at most ${MAX_FEATURED_COURSES} courses on the homepage.`);
      return;
    }

    // A hidden course can't also be a bestseller or pinned to the homepage.
    if (field === 'isHidden' && next && (course.isBestseller || course.isFeatured)) {
      toast.error('Remove the bestseller / homepage flags before hiding this course.');
      return;
    }

    const key = `${course._id}:${field}`;
    setTogglingKey(key);

    // Optimistically flip the flag, roll back on failure
    setCourses((prev) =>
      prev.map((c) => (c._id === course._id ? { ...c, [field]: next } : c))
    );

    try {
      const res = await fetch(`/api/courses/${course._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ [field]: next }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setCourses((prev) =>
          prev.map((c) => (c._id === course._id ? { ...c, [field]: !next } : c))
        );
        toast.error(data.message || 'Failed to update course.');
        return;
      }
      toast.success(
        field === 'isFeatured'
          ? next
            ? 'Added to homepage.'
            : 'Removed from homepage.'
          : field === 'isHidden'
            ? next
              ? 'Course hidden from public.'
              : 'Course is now visible.'
            : next
              ? 'Marked as bestseller.'
              : 'Bestseller removed.'
      );
    } catch {
      setCourses((prev) =>
        prev.map((c) => (c._id === course._id ? { ...c, [field]: !next } : c))
      );
      toast.error('Network error while updating.');
    } finally {
      setTogglingKey(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Courses</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Course management</h1>
          <p className="mt-2 text-slate-400">Create, edit, and publish your courses.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110"
        >
          <FiPlus className="h-4 w-4" /> New course
        </button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300 ring-1 ring-white/10">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-3xl font-bold text-white">{s.value}</span>
              </div>
              <p className="mt-4 text-sm uppercase tracking-[0.2em] text-slate-400">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-xs">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses…"
            className="w-full rounded-full border border-white/10 bg-slate-900/80 py-3 pl-12 pr-4 text-sm text-white outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {['all', ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Homepage capacity hint */}
      <p className="mt-4 text-xs text-slate-500">
        Homepage spots used: <span className="font-semibold text-slate-300">{featuredCount}/{MAX_FEATURED_COURSES}</span>
      </p>

      {/* Course cards */}
      <div className="mt-4">
        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-white/10 bg-slate-950/60 py-20 text-slate-400">
            <FiLoader className="h-5 w-5 animate-spin" /> Loading courses…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 py-20 text-center">
            <FiBookOpen className="mx-auto h-10 w-10 text-slate-600" />
            <p className="mt-4 text-lg font-semibold text-white">No courses yet</p>
            <p className="mt-1 text-slate-400">Create your first course to get started.</p>
            <button
              onClick={openCreate}
              className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-blue-500/40 hover:text-blue-200"
            >
              <FiPlus className="h-4 w-4" /> New course
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c) => {
              const teachers = c.teachers || [];
              return (
                <div
                  key={c._id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 transition-colors hover:border-white/20"
                >
                  {/* Thumbnail — links through to the course management page */}
                  <Link
                    href={`/pages/dashboard/admin/courses/${c._id}`}
                    className="relative block h-44 w-full overflow-hidden bg-white/5"
                  >
                    {c.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.thumbnail}
                        alt={c.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FiBookOpen className="h-9 w-9 text-slate-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />

                    {/* Status badge */}
                    <span
                      className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${statusStyles[c.status] || statusStyles.draft}`}
                    >
                      {c.status}
                    </span>

                    {/* Marketing marks */}
                    <div className="absolute right-3 top-3 flex gap-1.5">
                      {c.isBestseller && (
                        <span
                          title="Bestseller"
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30 backdrop-blur"
                        >
                          <FiAward className="h-3.5 w-3.5" />
                        </span>
                      )}
                      {c.isFeatured && (
                        <span
                          title="On homepage"
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 ring-1 ring-blue-400/30 backdrop-blur"
                        >
                          <FiHome className="h-3.5 w-3.5" />
                        </span>
                      )}
                      {c.isHidden && (
                        <span
                          title="Hidden from public"
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-500/30 text-slate-200 ring-1 ring-slate-400/30 backdrop-blur"
                        >
                          <FiEyeOff className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="absolute bottom-3 left-3">
                      {c.priceTier === 'free' ? (
                        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-bold text-emerald-200 ring-1 ring-emerald-400/30 backdrop-blur">
                          Free
                        </span>
                      ) : c.priceTier === 'discounted' && c.discountPrice ? (
                        <span className="inline-flex items-baseline gap-1.5 rounded-full bg-black/50 px-3 py-1 backdrop-blur">
                          <span className="text-sm font-bold text-white">৳{c.discountPrice}</span>
                          <span className="text-xs text-slate-400 line-through">৳{c.price}</span>
                        </span>
                      ) : (
                        <span className="rounded-full bg-black/50 px-3 py-1 text-sm font-bold text-white backdrop-blur">
                          ৳{c.price}
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="truncate">{c.category}</span>
                      <span className="text-slate-600">·</span>
                      <span className="capitalize">{c.level}</span>
                    </div>
                    <Link
                      href={`/pages/dashboard/admin/courses/${c._id}`}
                      className="mt-2 line-clamp-2 text-base font-semibold leading-snug text-white transition-colors hover:text-blue-200"
                    >
                      {c.title}
                    </Link>

                    {/* Meta: students + wishlist + teachers */}
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-sm text-slate-400" title="Enrolled students">
                          <FiUsers className="h-4 w-4" /> {c.studentsEnrolled?.length || 0}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-slate-400" title="Wishlisted by">
                          <FiHeart className="h-4 w-4" /> {c.inWishlistOf?.length || 0}
                        </span>
                      </div>
                      <TeacherAvatars teachers={teachers} />
                    </div>

                    {/* Bestseller / homepage toggles */}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => toggleFlag(c, 'isBestseller')}
                        disabled={togglingKey === `${c._id}:isBestseller`}
                        title={c.isBestseller ? 'Remove bestseller badge' : 'Mark as bestseller'}
                        aria-pressed={!!c.isBestseller}
                        className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                          c.isBestseller
                            ? 'border-amber-400/30 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                            : 'cursor-pointer border-white/10 bg-white/5 text-slate-400 hover:text-amber-200'
                        }`}
                      >
                        {togglingKey === `${c._id}:isBestseller` ? (
                          <FiLoader className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <FiAward className="h-3.5 w-3.5" />
                        )}
                        Bestseller
                      </button>

                      <button
                        onClick={() => toggleFlag(c, 'isFeatured')}
                        disabled={
                          togglingKey === `${c._id}:isFeatured` ||
                          (!c.isFeatured && featuredCount >= MAX_FEATURED_COURSES)
                        }
                        title={
                          c.isFeatured
                            ? 'Remove from homepage'
                            : featuredCount >= MAX_FEATURED_COURSES
                              ? `Homepage is full (${MAX_FEATURED_COURSES} max)`
                              : 'Show on homepage'
                        }
                        aria-pressed={!!c.isFeatured}
                        className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          c.isFeatured
                            ? 'cursor-pointer border-blue-400/30 bg-blue-500/15 text-blue-300 hover:bg-blue-500/25'
                            : featuredCount >= MAX_FEATURED_COURSES
                              ? 'cursor-not-allowed border-white/5 bg-white/[0.02] text-slate-600'
                              : 'cursor-pointer border-white/10 bg-white/5 text-slate-400 hover:text-blue-200'
                        }`}
                      >
                        {togglingKey === `${c._id}:isFeatured` ? (
                          <FiLoader className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <FiHome className="h-3.5 w-3.5" />
                        )}
                        Homepage
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-4">
                      <Link
                        href={`/pages/dashboard/admin/courses/${c._id}`}
                        className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-blue-500/40 hover:text-blue-200"
                      >
                        <FiSettings className="h-4 w-4" /> Manage
                      </Link>
                      <button
                        onClick={() => toggleFlag(c, 'isHidden')}
                        disabled={
                          togglingKey === `${c._id}:isHidden` ||
                          (!c.isHidden && (c.isBestseller || c.isFeatured))
                        }
                        title={
                          !c.isHidden && (c.isBestseller || c.isFeatured)
                            ? 'Remove the bestseller / homepage flags before hiding'
                            : c.isHidden
                              ? 'Make visible to the public'
                              : 'Hide from the public catalogue'
                        }
                        aria-pressed={!!c.isHidden}
                        className={`inline-flex h-10 w-10 flex-none items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                          c.isHidden
                            ? 'cursor-pointer border-slate-400/30 bg-slate-500/20 text-slate-200 hover:bg-slate-500/30'
                            : 'cursor-pointer border-white/10 bg-white/5 text-slate-300 hover:text-white'
                        }`}
                        aria-label={c.isHidden ? 'Make course visible' : 'Hide course'}
                      >
                        {togglingKey === `${c._id}:isHidden` ? (
                          <FiLoader className="h-4 w-4 animate-spin" />
                        ) : c.isHidden ? (
                          <FiEye className="h-4 w-4" />
                        ) : (
                          <FiEyeOff className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="inline-flex h-10 w-10 flex-none cursor-pointer items-center justify-center rounded-full border border-red-400/20 bg-red-500/10 text-red-300 transition-colors hover:bg-red-500/20"
                        aria-label="Delete course"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ---- Create modal ---- */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0a0a12] shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <h2 className="text-lg font-semibold text-white">Create course</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/5 text-slate-300 transition-colors hover:text-white"
                aria-label="Close"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-6">
              <CourseForm
                form={form}
                onField={handleField}
                setForm={setForm}
                categories={categories}
                featuredCount={featuredCount}
              />

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="cursor-pointer rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:text-blue-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving && <FiLoader className="h-4 w-4 animate-spin" />}
                  {saving ? 'Saving…' : 'Create course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- Delete confirmation ---- */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a12] p-7 shadow-2xl shadow-black/50">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-red-500/15 text-red-300 ring-1 ring-red-400/20">
                <FiAlertTriangle className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete course?</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  “{deleteTarget.title}” will be permanently removed. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
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

/* ------------------------------------------------------------------ */
/*  Small presentational helpers                                      */
/* ------------------------------------------------------------------ */

// Initials fallback when a teacher has no photo
function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

// Stacked avatars shown on each course card
function TeacherAvatars({ teachers = [] }) {
  if (teachers.length === 0) {
    return <span className="text-xs italic text-slate-600">No teachers</span>;
  }
  const shown = teachers.slice(0, 3);
  const extra = teachers.length - shown.length;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((t) =>
        t.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={t._id}
            src={t.photo}
            alt={t.name}
            title={t.name}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-950"
          />
        ) : (
          <span
            key={t._id}
            title={t.name}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-semibold text-blue-200 ring-2 ring-slate-950"
          >
            {initials(t.name) || '?'}
          </span>
        )
      )}
      {extra > 0 && (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-slate-300 ring-2 ring-slate-950">
          +{extra}
        </span>
      )}
    </div>
  );
}
