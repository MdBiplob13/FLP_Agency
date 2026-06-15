'use client';

import { FiBell, FiLoader, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import useNotifications from '@/hooks/notification/notificationHook';
import NotificationItem from './NotificationItem';

/**
 * Full-page notifications list with mark-all-read and per-row delete. Shared by
 * the admin and user dashboards — the page wrapper just supplies the heading.
 */
export default function NotificationsPanel({ title = 'Notifications', subtitle }) {
  const { notifications, unreadCount, loading, error, markRead, markAllRead, remove } =
    useNotifications({ limit: 50 });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Inbox</p>
          <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold tracking-tight text-white">
            {title}
            {unreadCount > 0 && (
              <span className="rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-3 py-1 text-sm font-semibold text-white">
                {unreadCount} new
              </span>
            )}
          </h1>
          {subtitle && <p className="mt-2 text-slate-400">{subtitle}</p>}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-blue-500/40 hover:text-white"
          >
            <FiCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      {/* Body */}
      <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center gap-3 py-20 text-slate-400">
            <FiLoader className="h-5 w-5 animate-spin" /> Loading notifications…
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <FiAlertTriangle className="mx-auto h-10 w-10 text-rose-400" />
            <p className="mt-4 text-lg font-semibold text-white">Couldn’t load notifications</p>
            <p className="mt-1 text-slate-400">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center">
            <FiBell className="mx-auto h-10 w-10 text-slate-600" />
            <p className="mt-4 text-lg font-semibold text-white">No notifications yet</p>
            <p className="mt-1 text-slate-400">New activity will show up here.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((n) => (
              <NotificationItem
                key={n._id}
                notification={n}
                onRead={markRead}
                onRemove={remove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
