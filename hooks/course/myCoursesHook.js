'use client';

import { useEffect, useState } from 'react';
import { authHeaders } from '@/lib/clientAuth';

/**
 * Fetch the current user's enrolled courses from /api/users/me/courses.
 *
 * Requires a logged-in user (sends the bearer token). State shape mirrors
 * useCourses: a list, a loading flag, an error string, and a refresh counter
 * to force a refetch (e.g. after enrolling/un-enrolling elsewhere).
 */
const useMyCourses = () => {
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
        const res = await fetch('/api/users/me/courses', { headers: authHeaders() });
        const data = await res.json();

        if (!cancelled) {
          if (res.ok && data.success) {
            setCourses(data.courses || []);
          } else {
            setCourses([]);
            setCoursesError(data.message || 'Failed to load your courses.');
          }
        }
      } catch (err) {
        console.error('Error loading my courses:', err);
        if (!cancelled) {
          setCourses([]);
          setCoursesError('Network error while loading your courses.');
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

  return { courses, setCourses, coursesLoading, coursesError, coursesRefresh, setCoursesRefresh };
};

export default useMyCourses;
