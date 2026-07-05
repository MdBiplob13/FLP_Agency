'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiUsers,
  FiUserCheck,
  FiShield,
  FiSearch,
  FiLoader,
  FiX,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiLock,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { authHeaders } from '@/lib/clientAuth';
import useUser from '@/hooks/user/userHook';

/* ------------------------------------------------------------------ */
/*  Constants — mirror the user model enums                           */
/* ------------------------------------------------------------------ */

const ROLE_FILTERS = ['all', 'user', 'teacher', 'admin', 'superadmin'];
const STATUSES = ['active', 'inactive', 'blocked'];
const ELEVATED = ['admin', 'superadmin'];
const PAGE_SIZE = 12;

// Build a windowed list of page numbers with "…" gaps for the pager
function getPageItems(current, total) {
  const items = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || (p >= current - 1 && p <= current + 1)) {
      items.push(p);
    } else if (items[items.length - 1] !== '…') {
      items.push('…');
    }
  }
  return items;
}

// Human label for the "user" role + visual styling per role
const roleLabel = (r) => (r === 'user' ? 'Student' : r);

const roleStyles = {
  user: 'text-text-muted bg-slate-500/10 ring-slate-500/20',
  teacher: 'text-success bg-success/10 ring-emerald-500/20',
  admin: 'text-primary bg-primary/10 ring-blue-500/20',
  superadmin: 'text-fuchsia-300 bg-fuchsia-500/10 ring-fuchsia-500/20',
};

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

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function AdminUsersPage() {
  const { user: currentUser } = useUser();
  const isSuperadmin = currentUser?.role === 'superadmin';

  const [users, setUsers] = useState([]);
  const [roleCounts, setRoleCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: PAGE_SIZE,
  });

  // Manage modal
  const [manageTarget, setManageTarget] = useState(null);
  const [draft, setDraft] = useState({ role: 'user', status: 'active' });
  const [saving, setSaving] = useState(false);

  /* ---- Load users (server-side paginated) ---- */
  async function loadUsers(targetPage = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        role: roleFilter,
        page: String(targetPage),
        limit: String(PAGE_SIZE),
      });
      if (appliedSearch) params.set('search', appliedSearch);

      const res = await fetch(`/api/users?${params.toString()}`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.users || []);
        setRoleCounts(data.roleCounts || {});
        if (data.pagination) setPagination(data.pagination);
      } else {
        toast.error(data.message || 'Failed to load users.');
      }
    } catch {
      toast.error('Network error while loading users.');
    } finally {
      setLoading(false);
    }
  }

  // Debounce the search box into appliedSearch
  useEffect(() => {
    const t = setTimeout(() => setAppliedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reload from page 1 whenever the role filter or applied search changes
  useEffect(() => {
    loadUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, appliedSearch]);

  function goToPage(p) {
    if (p < 1 || p > pagination.totalPages || p === pagination.page) return;
    loadUsers(p);
  }

  /* ---- Derived stats ---- */
  const totalUsers = useMemo(
    () => Object.values(roleCounts).reduce((sum, n) => sum + n, 0),
    [roleCounts]
  );

  const stats = [
    { label: 'Total users', value: totalUsers, icon: FiUsers },
    { label: 'Students', value: roleCounts.user || 0, icon: FiBookOpen },
    { label: 'Teachers', value: roleCounts.teacher || 0, icon: FiUserCheck },
    {
      label: 'Admins',
      value: (roleCounts.admin || 0) + (roleCounts.superadmin || 0),
      icon: FiShield,
    },
  ];

  /* ---- Permission helpers (UI side; the API re-checks everything) ---- */
  const isSelf = (u) => currentUser && u._id === currentUser._id;

  // Can the signed-in admin manage this account at all?
  function canManage(u) {
    if (isSelf(u)) return false; // never edit yourself
    if (ELEVATED.includes(u.role) && !isSuperadmin) return false; // admins can't touch admins
    return true;
  }

  // Roles the signed-in admin is allowed to assign
  const assignableRoles = isSuperadmin ? ['user', 'teacher', 'admin'] : ['user', 'teacher'];

  /* ---- Manage modal ---- */
  function openManage(u) {
    setManageTarget(u);
    setDraft({ role: u.role, status: u.status });
  }

  async function handleSave() {
    if (!manageTarget) return;
    const payload = {};
    if (draft.role !== manageTarget.role) payload.role = draft.role;
    if (draft.status !== manageTarget.status) payload.status = draft.status;

    if (!Object.keys(payload).length) {
      setManageTarget(null);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/users/${manageTarget._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to update user.');
        return;
      }
      toast.success('User updated.');
      setManageTarget(null);
      loadUsers(pagination.page);
    } catch {
      toast.error('Network error while updating user.');
    } finally {
      setSaving(false);
    }
  }

  // Quick "promote to teacher" shortcut for the common case
  async function promoteToTeacher(u) {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${u._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ role: 'teacher' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to promote user.');
        return;
      }
      toast.success(`${u.name} is now a teacher.`);
      loadUsers(pagination.page);
    } catch {
      toast.error('Network error while promoting user.');
    } finally {
      setSaving(false);
    }
  }

  const roleDirty =
    manageTarget && (draft.role !== manageTarget.role || draft.status !== manageTarget.status);

  return (
    <div>
      {/* Header */}
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-primary">Users</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-text">User management</h1>
        <p className="mt-2 text-text-muted">
          View everyone on the platform and manage their roles.
          {!isSuperadmin && (
            <span className="ml-1 text-text-subtle">Admin promotions are superadmin-only.</span>
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Toolbar */}
      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-xs">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-subtle" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone…"
            className="w-full rounded-full border border-border bg-surface-elevated/80 py-3 pl-12 pr-4 text-sm text-text outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {ROLE_FILTERS.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${
                roleFilter === r
                  ? 'bg-linear-to-r from-primary to-accent text-white'
                  : 'border border-border bg-surface-muted text-text-muted hover:text-text'
              }`}
            >
              {r === 'all' ? 'All' : roleLabel(r)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-surface">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-text-muted">
            <FiLoader className="h-5 w-5 animate-spin" /> Loading users…
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center">
            <FiUsers className="mx-auto h-10 w-10 text-text-subtle" />
            <p className="mt-4 text-lg font-semibold text-text">No users found</p>
            <p className="mt-1 text-text-muted">Try another search term or role filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => {
                  const manageable = canManage(u);
                  const self = isSelf(u);
                  return (
                    <tr key={u._id} className="transition-colors hover:bg-white/[0.02]">
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={u.photo}
                            alt={u.name}
                            className="h-10 w-10 flex-none rounded-full object-cover ring-2 ring-border"
                          />
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 font-semibold text-text">
                              <span className="truncate">{u.name}</span>
                              {self && (
                                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-muted">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="truncate text-xs text-text-subtle">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${roleStyles[u.role] || roleStyles.user}`}
                        >
                          {roleLabel(u.role)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${statusStyles[u.status] || statusStyles.active}`}
                        >
                          {u.status}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-4 text-text-muted">{formatDate(u.createdAt)}</td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {u.role === 'user' && manageable && (
                            <button
                              onClick={() => promoteToTeacher(u)}
                              disabled={saving}
                              className="hidden cursor-pointer items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex"
                            >
                              <FiUserCheck className="h-3.5 w-3.5" /> Make teacher
                            </button>
                          )}
                          {manageable ? (
                            <button
                              onClick={() => openManage(u)}
                              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-surface-muted px-4 py-1.5 text-xs font-semibold text-text transition-colors hover:border-primary/40 hover:text-primary"
                            >
                              Manage
                            </button>
                          ) : (
                            <span
                              title={
                                self
                                  ? 'You cannot change your own role'
                                  : 'Only a superadmin can manage this account'
                              }
                              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/[0.02] px-4 py-1.5 text-xs font-medium text-text-subtle"
                            >
                              <FiLock className="h-3.5 w-3.5" /> Locked
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && users.length > 0 && pagination.totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-text-muted">
            Showing{' '}
            <span className="font-semibold text-text">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>
            –
            <span className="font-semibold text-text">
              {(pagination.page - 1) * pagination.limit + users.length}
            </span>{' '}
            of <span className="font-semibold text-text">{pagination.total}</span>
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              aria-label="Previous page"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-muted text-text-muted transition-colors enabled:cursor-pointer enabled:hover:border-primary/40 enabled:hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronLeft className="h-4 w-4" />
            </button>

            {getPageItems(pagination.page, pagination.totalPages).map((it, i) =>
              it === '…' ? (
                <span key={`gap-${i}`} className="px-1.5 text-sm text-text-subtle">
                  …
                </span>
              ) : (
                <button
                  key={it}
                  onClick={() => goToPage(it)}
                  aria-current={it === pagination.page ? 'page' : undefined}
                  className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-semibold transition-colors ${
                    it === pagination.page
                      ? 'bg-linear-to-r from-primary to-accent text-white'
                      : 'cursor-pointer border border-border bg-surface-muted text-text-muted hover:border-primary/40 hover:text-primary'
                  }`}
                >
                  {it}
                </button>
              )
            )}

            <button
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              aria-label="Next page"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-muted text-text-muted transition-colors enabled:cursor-pointer enabled:hover:border-primary/40 enabled:hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ---- Manage modal ---- */}
      {manageTarget && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-surface-elevated shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <h2 className="text-lg font-semibold text-text">Manage user</h2>
              <button
                onClick={() => setManageTarget(null)}
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-surface-muted text-text-muted transition-colors hover:text-text"
                aria-label="Close"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              {/* Identity */}
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={manageTarget.photo}
                  alt={manageTarget.name}
                  className="h-16 w-16 flex-none rounded-full object-cover ring-2 ring-border"
                />
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-text">{manageTarget.name}</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ring-1 ${roleStyles[manageTarget.role] || roleStyles.user}`}
                  >
                    {roleLabel(manageTarget.role)}
                  </span>
                </div>
              </div>

              {/* Contact details */}
              <div className="space-y-2 rounded-2xl border border-border bg-surface px-4 py-4 text-sm text-text-muted">
                <p className="flex items-center gap-2.5">
                  <FiMail className="h-4 w-4 flex-none text-text-subtle" />
                  <span className="truncate">{manageTarget.email}</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <FiPhone className="h-4 w-4 flex-none text-text-subtle" />
                  <span className="truncate">{manageTarget.phone || '—'}</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <FiMapPin className="h-4 w-4 flex-none text-text-subtle" />
                  <span className="truncate">{manageTarget.address || '—'}</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <FiCalendar className="h-4 w-4 flex-none text-text-subtle" />
                  <span>Joined {formatDate(manageTarget.createdAt)}</span>
                </p>
              </div>

              {manageTarget.role === 'superadmin' ? (
                <p className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-3 text-xs leading-5 text-fuchsia-200">
                  This is a superadmin account. Its role cannot be reassigned from the dashboard.
                </p>
              ) : (
                <div>
                  <span className="text-sm font-medium text-text-muted">Role</span>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {assignableRoles.map((r) => {
                      const active = draft.role === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setDraft((d) => ({ ...d, role: r }))}
                          className={`cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium capitalize transition-colors ${
                            active
                              ? 'bg-linear-to-r from-primary to-accent text-white'
                              : 'border border-border bg-surface-muted text-text-muted hover:text-text'
                          }`}
                        >
                          {roleLabel(r)}
                        </button>
                      );
                    })}
                  </div>
                  {!isSuperadmin && (
                    <p className="mt-2 text-xs text-text-subtle">
                      Only a superadmin can grant the admin role.
                    </p>
                  )}
                </div>
              )}

              {/* Status */}
              <div>
                <span className="text-sm font-medium text-text-muted">Status</span>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {STATUSES.map((s) => {
                    const active = draft.status === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, status: s }))}
                        className={`cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium capitalize transition-colors ${
                          active
                            ? `ring-1 ${statusStyles[s]}`
                            : 'border border-border bg-surface-muted text-text-muted hover:text-text'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-5">
              <button
                type="button"
                onClick={() => setManageTarget(null)}
                className="cursor-pointer rounded-full border border-border-strong bg-surface-muted px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:text-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !roleDirty}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-linear-to-r from-primary to-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && <FiLoader className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
