'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FiBell, FiLoader, FiCheck } from 'react-icons/fi';
import useNotifications from '@/hooks/notification/notificationHook';
import NotificationItem from './NotificationItem';

/**
 * Header bell with an unread badge and a dropdown of recent notifications.
 *
 * @param {string} href Path to the full notifications page ("See all" link).
 */
export default function NotificationBell({ href }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { notifications, unreadCount, loading, markRead, markAllRead } =
    useNotifications({ limit: 8 });

  // Close on outside click / Escape.
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
        className="relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition-colors hover:text-white"
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <FiBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-1 text-[10px] font-bold text-white ring-2 ring-[#020205]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a12] shadow-2xl shadow-black/50 sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold text-white">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">
                  {unreadCount} new
                </span>
              )}
            </p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-blue-300 hover:text-blue-200"
              >
                <FiCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
                <FiLoader className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <FiBell className="mx-auto h-8 w-8 text-slate-600" />
                <p className="mt-3 text-sm text-slate-400">You're all caught up.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
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

          {/* Footer */}
          {href && (
            <Link
              href={href}
              onClick={() => setOpen(false)}
              className="block border-t border-white/10 px-4 py-3 text-center text-sm font-semibold text-blue-300 transition-colors hover:bg-white/5 hover:text-blue-200"
            >
              See all notifications
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
