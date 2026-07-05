'use client';

import { FiBell, FiLoader, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import useNotifications from '@/hooks/notification/notificationHook';
import NotificationItem from './NotificationItem';

export default function NotificationsPanel({ title = 'Notifications', subtitle }) {
  const { notifications, unreadCount, loading, error, markRead, markAllRead, remove } =
    useNotifications({ limit: 50 });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-primary">Inbox</p>
          <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold tracking-tight text-text">
            {title}
            {unreadCount > 0 && (
              <span className="rounded-full bg-linear-to-r from-primary to-accent px-3 py-1 text-sm font-semibold text-white">
                {unreadCount} new
              </span>
            )}
          </h1>
          {subtitle && <p className="mt-2 text-text-muted">{subtitle}</p>}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-surface-elevated px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:border-primary/40 hover:text-primary"
          >
            <FiCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-surface">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center gap-3 py-20 text-text-muted">
            <FiLoader className="h-5 w-5 animate-spin" /> Loading notifications…
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <FiAlertTriangle className="mx-auto h-10 w-10 text-danger" />
            <p className="mt-4 text-lg font-semibold text-text">Couldn't load notifications</p>
            <p className="mt-1 text-text-muted">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center">
            <FiBell className="mx-auto h-10 w-10 text-text-subtle" />
            <p className="mt-4 text-lg font-semibold text-text">No notifications yet</p>
            <p className="mt-1 text-text-muted">New activity will show up here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
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
