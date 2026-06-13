'use client';

import { FiUsers } from 'react-icons/fi';

export default function AdminUsersPage() {
  return (
    <div>
      <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Users</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">User management</h1>
      <p className="mt-2 text-slate-400">Manage platform users and roles.</p>

      <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-slate-950/40 py-24 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300 ring-1 ring-white/10">
          <FiUsers className="h-7 w-7" />
        </span>
        <p className="mt-5 text-lg font-semibold text-white">Coming soon</p>
        <p className="mt-1 max-w-sm text-sm text-slate-400">
          This section is reserved for user management. Build it out next.
        </p>
      </div>
    </div>
  );
}
