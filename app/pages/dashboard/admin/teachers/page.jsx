'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiUserCheck,
  FiUsers,
  FiStar,
  FiSearch,
  FiLoader,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiFacebook,
  FiInstagram,
  FiLinkedin,
} from 'react-icons/fi';
import { authHeaders } from '@/lib/clientAuth';

const statusStyles = {
  active: 'text-success bg-success/10 ring-emerald-500/20',
  inactive: 'text-warning bg-warning/10 ring-amber-500/20',
  blocked: 'text-danger bg-danger/10 ring-red-500/20',
};

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

const SOCIALS = [
  { key: 'facebook', icon: FiFacebook },
  { key: 'instagram', icon: FiInstagram },
  { key: 'linkedin', icon: FiLinkedin },
];

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  /* ---- Load all teachers (admins see every status) ---- */
  async function loadTeachers() {
    setLoading(true);
    try {
      const res = await fetch('/api/users?role=teacher&limit=100', { headers: authHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        setTeachers(data.users || []);
      } else {
        toast.error(data.message || 'Failed to load teachers.');
      }
    } catch {
      toast.error('Network error while loading teachers.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeachers();
  }, []);

  /* ---- Derived: search + stats ---- */
  const filtered = useMemo(() => {
    if (!search.trim()) return teachers;
    const q = search.toLowerCase();
    return teachers.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q) ||
        t.address?.toLowerCase().includes(q)
    );
  }, [teachers, search]);

  const featuredCount = useMemo(() => teachers.filter((t) => t.isFeatured).length, [teachers]);
  const activeCount = useMemo(
    () => teachers.filter((t) => t.status === 'active').length,
    [teachers]
  );

  const stats = [
    { label: 'Total teachers', value: teachers.length, icon: FiUsers },
    { label: 'Active', value: activeCount, icon: FiUserCheck },
    { label: 'Featured', value: `${featuredCount}/1`, icon: FiStar },
  ];

  /* ---- Feature toggle (only one teacher can be featured) ---- */
  async function toggleFeatured(teacher) {
    const next = !teacher.isFeatured;
    setTogglingId(teacher._id);

    // Optimistic: set this one, and since only one may be featured, clear the rest
    setTeachers((prev) =>
      prev.map((t) => {
        if (t._id === teacher._id) return { ...t, isFeatured: next };
        if (next) return { ...t, isFeatured: false };
        return t;
      })
    );

    try {
      const res = await fetch(`/api/teachers/${teacher._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ isFeatured: next }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to update featured teacher.');
        loadTeachers(); // re-sync on failure
        return;
      }
      toast.success(next ? `${teacher.name} is now the featured teacher.` : 'Featured teacher cleared.');
    } catch {
      toast.error('Network error while updating.');
      loadTeachers();
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-primary">Our Teachers</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-text">Teacher management</h1>
        <p className="mt-2 text-text-muted">
          View every instructor and choose the one featured across the site.
          <span className="ml-1 text-text-subtle">Only one teacher can be featured at a time.</span>
        </p>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-3xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-border">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-3xl font-bold text-text">{s.value}</span>
              </div>
              <p className="mt-4 text-sm uppercase tracking-[0.2em] text-text-muted">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="mt-10">
        <label className="relative block w-full sm:max-w-xs">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-subtle" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teachers…"
            className="w-full rounded-full border border-border bg-surface-elevated/80 py-3 pl-12 pr-4 text-sm text-text outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
          />
        </label>
      </div>

      {/* Teacher cards */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-border bg-surface py-20 text-text-muted">
            <FiLoader className="h-5 w-5 animate-spin" /> Loading teachers…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-border bg-surface py-20 text-center">
            <FiUserCheck className="mx-auto h-10 w-10 text-text-subtle" />
            <p className="mt-4 text-lg font-semibold text-text">No teachers found</p>
            <p className="mt-1 text-text-muted">
              {teachers.length === 0
                ? 'Promote a user to teacher from the Users page to get started.'
                : 'Try another search term.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((t) => {
              const links = t.socialLinks || {};
              const hasSocials = SOCIALS.some((s) => links[s.key]);
              const toggling = togglingId === t._id;
              return (
                <div
                  key={t._id}
                  className={`group relative flex flex-col rounded-3xl border bg-surface p-6 transition-colors ${
                    t.isFeatured
                      ? 'border-amber-400/40 ring-1 ring-amber-400/20'
                      : 'border-border hover:border-border-strong'
                  }`}
                >
                  {/* Featured ribbon */}
                  {t.isFeatured && (
                    <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-1 text-[11px] font-semibold text-warning ring-1 ring-amber-400/30">
                      <FiStar className="h-3 w-3 fill-amber-300" /> Featured
                    </span>
                  )}

                  {/* Identity */}
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.photo}
                      alt={t.name}
                      className="h-16 w-16 flex-none rounded-full object-cover ring-2 ring-border"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold text-text">{t.name}</p>
                      <span
                        className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ring-1 ${statusStyles[t.status] || statusStyles.active}`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-5 space-y-2 text-sm text-text-muted">
                    <p className="flex items-center gap-2.5">
                      <FiMail className="h-4 w-4 flex-none text-text-subtle" />
                      <span className="truncate">{t.email}</span>
                    </p>
                    <p className="flex items-center gap-2.5">
                      <FiMapPin className="h-4 w-4 flex-none text-text-subtle" />
                      <span className="truncate">{t.address || '—'}</span>
                    </p>
                    <p className="flex items-center gap-2.5">
                      <FiCalendar className="h-4 w-4 flex-none text-text-subtle" />
                      <span>Joined {formatDate(t.createdAt)}</span>
                    </p>
                  </div>

                  {/* Socials */}
                  {hasSocials && (
                    <div className="mt-4 flex items-center gap-2">
                      {SOCIALS.map(({ key, icon: Icon }) =>
                        links[key] ? (
                          <a
                            key={key}
                            href={links[key]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-muted text-text-muted transition-colors hover:border-primary/40 hover:text-primary"
                            aria-label={key}
                          >
                            <Icon className="h-4 w-4" />
                          </a>
                        ) : null
                      )}
                    </div>
                  )}

                  {/* Feature toggle */}
                  <div className="mt-6 border-t border-border pt-5">
                    <button
                      onClick={() => toggleFeatured(t)}
                      disabled={toggling}
                      className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        t.isFeatured
                          ? 'border border-amber-400/30 bg-warning/15 text-warning hover:bg-amber-500/25'
                          : 'border border-border bg-surface-muted text-text hover:border-amber-400/30 hover:text-amber-200'
                      }`}
                    >
                      {toggling ? (
                        <FiLoader className="h-4 w-4 animate-spin" />
                      ) : (
                        <FiStar className={`h-4 w-4 ${t.isFeatured ? 'fill-amber-300' : ''}`} />
                      )}
                      {t.isFeatured ? 'Featured teacher' : 'Make featured'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
