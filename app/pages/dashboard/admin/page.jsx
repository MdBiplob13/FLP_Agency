'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FiBookOpen,
  FiUsers,
  FiHeart,
  FiCheckCircle,
  FiArrowRight,
  FiPlus,
  FiLoader,
} from 'react-icons/fi';
import { authHeaders } from '@/lib/clientAuth';
import useUser from '@/hooks/user/userHook';

export default function AdminOverviewPage() {
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/courses?status=all&limit=50', { headers: authHeaders() });
        const data = await res.json();
        if (!cancelled && res.ok && data.success) setCourses(data.courses || []);
      } catch {
        // overview is best-effort; errors are non-blocking
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const published = courses.filter((c) => c.status === 'published').length;
    const students = courses.reduce((sum, c) => sum + (c.studentsEnrolled?.length || 0), 0);
    const wishlisted = courses.reduce((sum, c) => sum + (c.inWishlistOf?.length || 0), 0);
    return [
      { label: 'Total courses', value: courses.length, icon: FiBookOpen, href: '/pages/dashboard/admin/courses' },
      { label: 'Published', value: published, icon: FiCheckCircle, href: '/pages/dashboard/admin/courses' },
      { label: 'Enrollments', value: students, icon: FiUsers },
      { label: 'Wishlisted', value: wishlisted, icon: FiHeart },
    ];
  }, [courses]);

  const recent = courses.slice(0, 5);

  return (
    <div>
      {/* Header */}
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Welcome back{user ? `, ${user.name}` : ''}.
        </h1>
        <p className="mt-2 text-slate-400">Here's an overview of your platform.</p>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          const card = (
            <div className="h-full rounded-3xl border border-white/10 bg-slate-950/60 p-6 transition-colors hover:border-blue-500/30">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300 ring-1 ring-white/10">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-3xl font-bold text-white">{loading ? '—' : s.value}</span>
              </div>
              <p className="mt-4 text-sm uppercase tracking-[0.2em] text-slate-400">{s.label}</p>
            </div>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="cursor-pointer">
              {card}
            </Link>
          ) : (
            <div key={s.label}>{card}</div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        <Link
          href="/pages/dashboard/admin/courses"
          className="group flex cursor-pointer items-center justify-between rounded-3xl border border-white/10 bg-linear-to-br from-blue-600/15 to-purple-600/10 p-6 transition-colors hover:border-blue-500/40"
        >
          <div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/20 text-blue-200">
              <FiPlus className="h-5 w-5" />
            </span>
            <p className="mt-4 font-semibold text-white">Manage courses</p>
            <p className="mt-1 text-sm text-slate-400">Create, edit and publish courses.</p>
          </div>
          <FiArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Recent courses */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent courses</h2>
          <Link
            href="/pages/dashboard/admin/courses"
            className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-blue-300 hover:text-blue-200"
          >
            View all <FiArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
              <FiLoader className="h-5 w-5 animate-spin" /> Loading…
            </div>
          ) : recent.length === 0 ? (
            <div className="py-16 text-center">
              <FiBookOpen className="mx-auto h-9 w-9 text-slate-600" />
              <p className="mt-3 font-semibold text-white">No courses yet</p>
              <Link
                href="/pages/dashboard/admin/courses"
                className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-blue-500/40 hover:text-blue-200"
              >
                <FiPlus className="h-4 w-4" /> Create one
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {recent.map((c) => (
                <li key={c._id} className="flex items-center gap-4 px-6 py-4">
                  <span className="flex h-10 w-14 flex-none items-center justify-center overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10">
                    {c.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.thumbnail} alt={c.title} className="h-full w-full object-cover" />
                    ) : (
                      <FiBookOpen className="h-4 w-4 text-slate-500" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{c.title}</p>
                    <p className="truncate text-xs text-slate-500">{c.category}</p>
                  </div>
                  <span className="text-sm text-slate-400">{c.studentsEnrolled?.length || 0} students</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
