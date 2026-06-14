'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, animate, useInView, useReducedMotion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  FiUsers,
  FiBookOpen,
  FiFileText,
  FiUserCheck,
  FiEye,
  FiTag,
  FiTrendingUp,
  FiDollarSign,
  FiArrowRight,
  FiArrowUpRight,
  FiPlus,
  FiActivity,
  FiAward,
} from 'react-icons/fi';
import { authHeaders } from '@/lib/clientAuth';
import useUser from '@/hooks/user/userHook';

const easeOut = [0.22, 1, 0.36, 1];
const COLORS = ['#3b82f6', '#a855f7', '#34d399', '#fbbf24', '#fb7185', '#22d3ee'];
const STATUS_COLORS = { Published: '#34d399', Draft: '#fbbf24', Archived: '#94a3b8' };

const fmt = (n = 0) => Number(n).toLocaleString();
const taka = (n = 0) => `৳${Number(n).toLocaleString()}`;

function timeAgo(value) {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  const day = 86400000;
  if (diff < day) return 'today';
  if (diff < 2 * day) return 'yesterday';
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const roleStyles = {
  user: 'text-sky-300 bg-sky-500/10 ring-sky-500/20',
  teacher: 'text-purple-300 bg-purple-500/10 ring-purple-500/20',
  admin: 'text-amber-300 bg-amber-500/10 ring-amber-500/20',
  superadmin: 'text-rose-300 bg-rose-500/10 ring-rose-500/20',
};
const statusStyles = {
  draft: 'text-amber-300 bg-amber-500/10 ring-amber-500/20',
  published: 'text-emerald-300 bg-emerald-500/10 ring-emerald-500/20',
  archived: 'text-slate-400 bg-slate-500/10 ring-slate-500/20',
};

/* ------------------------------------------------------------------ */
/*  Small UI helpers                                                  */
/* ------------------------------------------------------------------ */

function Reveal({ children, delay = 0, className = '' }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: easeOut }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ to = 0, duration = 1.4 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setVal(to);
      return;
    }
    const controls = animate(0, to, { duration, ease: 'easeOut', onUpdate: (v) => setVal(v) });
    return () => controls.stop();
  }, [inView, to, duration, reduce]);

  return <span ref={ref}>{Math.round(val).toLocaleString()}</span>;
}

function ChartTooltip({ active, payload, label, money }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0a12]/95 px-3 py-2 text-xs shadow-2xl shadow-black/50 backdrop-blur">
      {label ? <p className="mb-1 font-semibold text-white">{label}</p> : null}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2 text-slate-300">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.payload?.fill }} />
          <span className="capitalize">{p.name}</span>
          <span className="ml-auto pl-3 font-semibold text-white">
            {money ? taka(p.value) : fmt(p.value)}
          </span>
        </p>
      ))}
    </div>
  );
}

function Card({ children, className = '' }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-slate-950/60 p-5 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

function ChartHeading({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        {Icon ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300 ring-1 ring-white/10">
            <Icon className="h-4.5 w-4.5" />
          </span>
        ) : null}
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {subtitle ? <p className="text-xs text-slate-400">{subtitle}</p> : null}
        </div>
      </div>
      {action}
    </div>
  );
}

/* Donut with a centred total label */
function DonutCard({ icon, title, subtitle, data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <Card>
      <ChartHeading icon={icon} title={title} subtitle={subtitle} />
      {total === 0 ? (
        <EmptyChart />
      ) : (
        <>
          <div className="relative h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={3}
                  stroke="none"
                >
                  {data.map((d, i) => (
                    <Cell key={i} fill={STATUS_COLORS[d.name] || COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">{fmt(total)}</span>
              <span className="text-xs text-slate-500">Total</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {data.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: STATUS_COLORS[d.name] || COLORS[i % COLORS.length] }}
                />
                <span className="text-slate-300">{d.name}</span>
                <span className="ml-auto font-semibold text-white">{fmt(d.value)}</span>
                <span className="w-12 text-right text-xs text-slate-500">
                  {total ? Math.round((d.value / total) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-52 flex-col items-center justify-center text-center text-slate-500">
      <FiActivity className="h-8 w-8" />
      <p className="mt-2 text-sm">No data yet</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

const QUICK_ACTIONS = [
  { label: 'New course', href: '/pages/dashboard/admin/courses', icon: FiBookOpen },
  { label: 'New blog post', href: '/pages/dashboard/admin/blogs', icon: FiFileText },
  { label: 'Manage users', href: '/pages/dashboard/admin/users', icon: FiUsers },
  { label: 'Our teachers', href: '/pages/dashboard/admin/teachers', icon: FiUserCheck },
];

export default function AdminOverviewPage() {
  const { user } = useUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/stats', { headers: authHeaders() });
        const data = await res.json();
        if (!cancelled) {
          if (res.ok && data.success) setStats(data.stats);
          else setError(data.message || 'Failed to load dashboard.');
        }
      } catch {
        if (!cancelled) setError('Network error while loading the dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const t = stats?.totals;
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const kpis = t
    ? [
        { label: 'Total users', value: t.users, icon: FiUsers, accent: 'from-sky-500/20 to-blue-500/5', ring: 'text-sky-300', sub: `${fmt(t.activeUsers)} active`, href: '/pages/dashboard/admin/users' },
        { label: 'Revenue', value: t.revenue, money: true, icon: FiDollarSign, accent: 'from-emerald-500/20 to-emerald-500/5', ring: 'text-emerald-300', sub: `${fmt(t.enrollments)} enrollments` },
        { label: 'Enrollments', value: t.enrollments, icon: FiTrendingUp, accent: 'from-blue-500/20 to-indigo-500/5', ring: 'text-blue-300', sub: `${fmt(t.wishlists)} wishlisted` },
        { label: 'Courses', value: t.courses, icon: FiBookOpen, accent: 'from-purple-500/20 to-fuchsia-500/5', ring: 'text-purple-300', sub: `${fmt(t.publishedCourses)} published`, href: '/pages/dashboard/admin/courses' },
        { label: 'Blog posts', value: t.blogs, icon: FiFileText, accent: 'from-pink-500/20 to-rose-500/5', ring: 'text-pink-300', sub: `${fmt(t.publishedBlogs)} published`, href: '/pages/dashboard/admin/blogs' },
        { label: 'Teachers', value: t.teachers, icon: FiUserCheck, accent: 'from-violet-500/20 to-purple-500/5', ring: 'text-violet-300', sub: 'Mentors', href: '/pages/dashboard/admin/teachers' },
        { label: 'Blog views', value: t.blogViews, icon: FiEye, accent: 'from-cyan-500/20 to-sky-500/5', ring: 'text-cyan-300', sub: 'All-time reads' },
        { label: 'Categories', value: t.categories, icon: FiTag, accent: 'from-amber-500/20 to-orange-500/5', ring: 'text-amber-300', sub: 'Topics', href: '/pages/dashboard/admin/categories' },
      ]
    : [];

  return (
    <div>
      {/* ===== Header ===== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}.
          </h1>
          <p className="mt-2 text-slate-400">{today}</p>
        </div>
        
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      {/* ===== KPI cards ===== */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-3xl border border-white/10 bg-slate-950/60" />
            ))
          : kpis.map((k, i) => {
              const inner = (
                <Reveal delay={i * 0.04} className="h-full">
                  <div className={`group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br ${k.accent} p-5 transition-colors hover:border-blue-500/30`}>
                    <div className="flex items-center justify-between">
                      <span className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 ${k.ring}`}>
                        <k.icon className="h-5 w-5" />
                      </span>
                      {k.href && <FiArrowUpRight className="h-4 w-4 text-slate-500 transition-colors group-hover:text-blue-300" />}
                    </div>
                    <p className="mt-4 text-3xl font-bold text-white">
                      {k.money ? <>৳<CountUp to={k.value} /></> : <CountUp to={k.value} />}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-300">{k.label}</p>
                    <p className="text-xs text-slate-500">{k.sub}</p>
                  </div>
                </Reveal>
              );
              return k.href ? (
                <Link key={k.label} href={k.href} className="cursor-pointer">{inner}</Link>
              ) : (
                <div key={k.label}>{inner}</div>
              );
            })}
      </div>

      {/* ===== Quick actions ===== */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 transition-colors hover:border-blue-500/30"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300 ring-1 ring-white/10">
              <a.icon className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-white">{a.label}</span>
            <FiArrowRight className="ml-auto h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="h-80 animate-pulse rounded-3xl border border-white/10 bg-slate-950/60 lg:col-span-2" />
          <div className="h-80 animate-pulse rounded-3xl border border-white/10 bg-slate-950/60" />
        </div>
      ) : stats ? (
        <>
          {/* ===== Row A: growth + users by role ===== */}
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <Reveal className="lg:col-span-2">
              <Card>
                <ChartHeading icon={FiTrendingUp} title="Platform growth" subtitle="New users, courses & posts over the last 6 months" />
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.growth} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gCourses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gBlogs" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#34d399" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} width={36} />
                      <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                      <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} fill="url(#gUsers)" />
                      <Area type="monotone" dataKey="courses" stroke="#a855f7" strokeWidth={2} fill="url(#gCourses)" />
                      <Area type="monotone" dataKey="blogs" stroke="#34d399" strokeWidth={2} fill="url(#gBlogs)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <Legend color="#3b82f6" label="Users" />
                  <Legend color="#a855f7" label="Courses" />
                  <Legend color="#34d399" label="Blogs" />
                </div>
              </Card>
            </Reveal>

            <Reveal delay={0.05}>
              <DonutCard icon={FiUsers} title="Users by role" subtitle="Audience breakdown" data={stats.usersByRole} />
            </Reveal>
          </div>

          {/* ===== Row B: top courses + course status ===== */}
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <Reveal className="lg:col-span-2">
              <Card>
                <ChartHeading
                  icon={FiAward}
                  title="Top courses by enrollment"
                  subtitle="Your best performers"
                  action={
                    <Link href="/pages/dashboard/admin/courses" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 hover:text-blue-200">
                      All courses <FiArrowRight className="h-4 w-4" />
                    </Link>
                  }
                />
                {stats.topCourses.length === 0 || stats.topCourses.every((c) => c.students === 0) ? (
                  <EmptyChart />
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.topCourses} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                        <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <YAxis
                          type="category"
                          dataKey="title"
                          tick={{ fill: '#cbd5e1', fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          width={130}
                          tickFormatter={(v) => (v.length > 18 ? `${v.slice(0, 18)}…` : v)}
                        />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                        <Bar dataKey="students" name="Students" radius={[0, 6, 6, 0]} barSize={18}>
                          {stats.topCourses.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            </Reveal>

            <Reveal delay={0.05}>
              <DonutCard icon={FiBookOpen} title="Courses by status" subtitle="Publishing pipeline" data={stats.coursesByStatus} />
            </Reveal>
          </div>

          {/* ===== Row C: categories + blog status ===== */}
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <Reveal className="lg:col-span-2">
              <Card>
                <ChartHeading icon={FiTag} title="Courses by category" subtitle="Where your catalogue is concentrated" />
                {stats.coursesByCategory.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.coursesByCategory} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: '#94a3b8', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => (v.length > 10 ? `${v.slice(0, 10)}…` : v)}
                        />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} width={36} />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                        <Bar dataKey="value" name="Courses" radius={[6, 6, 0, 0]} barSize={36}>
                          {stats.coursesByCategory.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            </Reveal>

            <Reveal delay={0.05}>
              <DonutCard icon={FiFileText} title="Blog posts by status" subtitle="Content pipeline" data={stats.blogsByStatus} />
            </Reveal>
          </div>

          {/* ===== Recent activity ===== */}
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {/* Recent users */}
            <Reveal>
              <Card className="h-full">
                <ChartHeading
                  icon={FiUsers}
                  title="New members"
                  action={<Link href="/pages/dashboard/admin/users" className="text-sm font-semibold text-blue-300 hover:text-blue-200">All</Link>}
                />
                <ActivityList
                  items={stats.recentUsers}
                  empty="No users yet"
                  render={(u) => (
                    <>
                      <span className="flex h-9 w-9 flex-none items-center justify-center overflow-hidden rounded-full bg-white/5 text-xs font-bold text-white ring-1 ring-white/10">
                        {u.photo ? <img src={u.photo} alt={u.name} className="h-full w-full object-cover" /> : (u.name?.[0] || '?')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{u.name}</p>
                        <p className="truncate text-xs text-slate-500">{u.email}</p>
                      </div>
                      <span className={`flex-none rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ${roleStyles[u.role] || roleStyles.user}`}>
                        {u.role}
                      </span>
                    </>
                  )}
                />
              </Card>
            </Reveal>

            {/* Recent courses */}
            <Reveal delay={0.05}>
              <Card className="h-full">
                <ChartHeading
                  icon={FiBookOpen}
                  title="Latest courses"
                  action={<Link href="/pages/dashboard/admin/courses" className="text-sm font-semibold text-blue-300 hover:text-blue-200">All</Link>}
                />
                <ActivityList
                  items={stats.recentCourses}
                  empty="No courses yet"
                  render={(c) => (
                    <>
                      <span className="flex h-9 w-12 flex-none items-center justify-center overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10">
                        {c.thumbnail ? <img src={c.thumbnail} alt={c.title} className="h-full w-full object-cover" /> : <FiBookOpen className="h-4 w-4 text-slate-500" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{c.title}</p>
                        <p className="truncate text-xs text-slate-500">{c.students} students · {timeAgo(c.createdAt)}</p>
                      </div>
                      <span className={`flex-none rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ${statusStyles[c.status] || statusStyles.draft}`}>
                        {c.status}
                      </span>
                    </>
                  )}
                />
              </Card>
            </Reveal>

            {/* Recent blogs */}
            <Reveal delay={0.1}>
              <Card className="h-full">
                <ChartHeading
                  icon={FiFileText}
                  title="Latest posts"
                  action={<Link href="/pages/dashboard/admin/blogs" className="text-sm font-semibold text-blue-300 hover:text-blue-200">All</Link>}
                />
                <ActivityList
                  items={stats.recentBlogs}
                  empty="No posts yet"
                  render={(b) => (
                    <>
                      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-white/5 text-slate-500 ring-1 ring-white/10">
                        <FiFileText className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{b.title}</p>
                        <p className="truncate text-xs text-slate-500">{fmt(b.views)} views · {timeAgo(b.createdAt)}</p>
                      </div>
                      <span className={`flex-none rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ${statusStyles[b.status] || statusStyles.draft}`}>
                        {b.status}
                      </span>
                    </>
                  )}
                />
              </Card>
            </Reveal>
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

function Legend({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function ActivityList({ items, render, empty }) {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500">
        <FiPlus className="h-7 w-7" />
        <p className="mt-2 text-sm">{empty}</p>
      </div>
    );
  }
  return (
    <ul className="space-y-1">
      {items.map((it) => (
        <li key={it.id} className="flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-white/5">
          {render(it)}
        </li>
      ))}
    </ul>
  );
}
