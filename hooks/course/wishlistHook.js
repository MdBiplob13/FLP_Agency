'use client';

import { useCallback, useEffect, useState } from 'react';
import { authHeaders } from '@/lib/clientAuth';

/**
 * Fetch + manage the current user's wishlisted courses.
 *
 * Reads from /api/users/me/wishlist (requires a logged-in user) and exposes a
 * `toggle(courseId)` that flips a course in/out of the wishlist via the existing
 * POST /api/courses/[id]/wishlist endpoint, then refetches so the list stays in
 * sync. State shape mirrors useMyCourses: a list, a loading flag, an error
 * string, and a refresh counter to force a refetch.
 */
const useWishlist = () => {
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);
  const [coursesRefresh, setCoursesRefresh] = useState(1);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setCoursesLoading(true);
      setCoursesError(null);
      try {
        const res = await fetch('/api/users/me/wishlist', { headers: authHeaders() });
        const data = await res.json();

        if (!cancelled) {
          if (res.ok && data.success) {
            setCourses(data.courses || []);
          } else {
            setCourses([]);
            setCoursesError(data.message || 'Failed to load your wishlist.');
          }
        }
      } catch (err) {
        console.error('Error loading wishlist:', err);
        if (!cancelled) {
          setCourses([]);
          setCoursesError('Network error while loading your wishlist.');
        }
      } finally {
        if (!cancelled) setCoursesLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [coursesRefresh]);

  // Toggle a course in/out of the wishlist. Returns the new `wishlisted` flag
  // (or null on failure). Refreshes the list on success so callers don't have
  // to manage it themselves.
  const toggle = useCallback(async (courseId) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/wishlist`, {
        method: 'POST',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCoursesRefresh((n) => n + 1);
        return data.wishlisted;
      }
      return null;
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      return null;
    }
  }, []);

  return {
    courses,
    setCourses,
    coursesLoading,
    coursesError,
    coursesRefresh,
    setCoursesRefresh,
    toggle,
  };
};

export default useWishlist;
