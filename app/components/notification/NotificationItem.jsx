'use client';

import Link from 'next/link';
import {
  FiUserPlus,
  FiShoppingBag,
  FiHeart,
  FiBell,
  FiCalendar,
  FiCheckCircle,
  FiTrash2,
} from 'react-icons/fi';

const TYPE_META = {
  signup: { icon: FiUserPlus, accent: 'bg-primary/15 text-primary' },
  enrollment: { icon: FiShoppingBag, accent: 'bg-success/15 text-success' },
  wishlist: { icon: FiHeart, accent: 'bg-danger/15 text-danger' },
  announcement: { icon: FiBell, accent: 'bg-accent/15 text-accent' },
  schedule: { icon: FiCalendar, accent: 'bg-warning/15 text-warning' },
  welcome: { icon: FiCheckCircle, accent: 'bg-success/15 text-success' },
};

function timeAgo(value) {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  const sec = Math.round(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function NotificationItem({ notification, onRead, onRemove, compact = false }) {
  const meta = TYPE_META[notification.type] || { icon: FiBell, accent: 'bg-surface-muted text-text-muted' };
  const Icon = meta.icon;

  const handleClick = () => {
    if (!notification.read) onRead?.(notification._id);
  };

  const inner = (
    <div className={`flex items-start gap-3 ${compact ? 'px-4 py-3' : 'px-5 py-4'}`}>
      <span className={`mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-full ring-1 ring-border ${meta.accent}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`font-semibold text-text ${compact ? 'text-sm' : 'text-sm'} ${notification.read ? '' : 'pr-2'}`}>
          {notification.title}
        </p>
        {notification.body && (
          <p className={`mt-0.5 text-text-muted ${compact ? 'line-clamp-2 text-xs' : 'text-sm'}`}>
            {notification.body}
          </p>
        )}
        <p className="mt-1 text-xs text-text-subtle">{timeAgo(notification.createdAt)}</p>
      </div>
      {!notification.read && (
        <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-primary" aria-label="Unread" />
      )}
      {onRemove && !compact && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(notification._id);
          }}
          className="ml-1 inline-flex h-7 w-7 flex-none cursor-pointer items-center justify-center rounded-lg border border-border bg-surface-muted text-text-muted transition-colors hover:text-danger"
          aria-label="Delete notification"
        >
          <FiTrash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );

  const base = `block w-full text-left transition-colors hover:bg-surface-muted ${
    notification.read ? '' : 'bg-primary/[0.04]'
  }`;

  if (notification.link) {
    return (
      <Link href={notification.link} onClick={handleClick} className={`${base} cursor-pointer`}>
        {inner}
      </Link>
    );
  }
  return (
    <button onClick={handleClick} className={`${base} cursor-pointer`}>
      {inner}
    </button>
  );
}
