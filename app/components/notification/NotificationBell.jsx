'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FiBell, FiLoader, FiCheck } from 'react-icons/fi';
import useNotifications from '@/hooks/notification/notificationHook';
import NotificationItem from './NotificationItem';

export default function NotificationBell({ href }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { notifications, unreadCount, loading, markRead, markAllRead } =
    useNotifications({ limit: 8 });

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-surface-elevated text-text-muted transition-colors hover:text-text"
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <FiBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-linear-to-r from-primary to-accent px-1 text-[10px] font-bold text-white ring-2 ring-background">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-elevated sm:w-96">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-text">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-muted">
                  {unreadCount} new
                </span>
              )}
            </p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover"
              >
                <FiCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-text-muted">
                <FiLoader className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <FiBell className="mx-auto h-8 w-8 text-text-subtle" />
                <p className="mt-3 text-sm text-text-muted">You're all caught up.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((n) => (
                  <NotificationItem
                    key={n._id}
                    notification={n}
                    onRead={markRead}
                    compact
                  />
                ))}
              </div>
            )}
          </div>

          {href && (
            <Link
              href={href}
              onClick={() => setOpen(false)}
              className="block border-t border-border px-4 py-3 text-center text-sm font-semibold text-primary transition-colors hover:bg-surface-muted hover:text-primary-hover"
            >
              See all notifications
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
