'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { authHeaders } from '@/lib/clientAuth';

/**
 * Current user's notification feed from /api/notifications.
 *
 * Polls on an interval so the unread badge stays roughly live without websockets.
 * Exposes the list, the unread count, and mutators that optimistically update
 * local state then reconcile with the server.
 *
 * @param {object} [opts]
 * @param {number} [opts.limit=20]      Max rows to fetch.
 * @param {number} [opts.pollMs=60000]  Poll interval; 0 disables polling.
 */
const useNotifications = ({ limit = 20, pollMs = 60000 } = {}) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Skip state updates after unmount.
  const mounted = useRef(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/notifications?limit=${limit}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!mounted.current) return;
      if (res.ok && data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        setError(null);
      } else {
        setError(data.message || 'Failed to load notifications.');
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
      if (mounted.current) setError('Network error while loading notifications.');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    mounted.current = true;
    load();

    if (!pollMs) return () => { mounted.current = false; };
    const t = setInterval(load, pollMs);
    return () => {
      mounted.current = false;
      clearInterval(t);
    };
  }, [load, pollMs]);

  // Mark one notification read (optimistic).
  const markRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id && !n.read ? { ...n, read: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ read: true }),
      });
    } catch {
      /* best-effort; next poll reconciles */
    }
  }, []);

  // Mark every notification read (optimistic).
  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await fetch('/api/notifications', { method: 'PATCH', headers: authHeaders() });
    } catch {
      /* best-effort */
    }
  }, []);

  // Delete one notification (optimistic).
  const remove = useCallback(async (id) => {
    let wasUnread = false;
    setNotifications((prev) => {
      const target = prev.find((n) => n._id === id);
      wasUnread = target ? !target.read : false;
      return prev.filter((n) => n._id !== id);
    });
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE', headers: authHeaders() });
    } catch {
      /* best-effort */
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh: load,
    markRead,
    markAllRead,
    remove,
  };
};

export default useNotifications;
