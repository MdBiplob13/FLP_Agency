'use client'
import { useEffect, useRef, useState } from "react";

/**
 * Fetch the public course catalogue from /api/courses.
 *
 * The public endpoint only ever returns published courses, so this hook is
 * safe to use on marketing pages. State shape mirrors useUser: a loading flag,
 * an error string, and a refresh counter to force a refetch (e.g. after an
 * action elsewhere on the page).
 *
 * @param {object} [options]
 * @param {number} [options.limit=50] Max courses to request in one page.
 */
const useCourses = ({ limit = 50 } = {}) => {
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);
  const [coursesRefresh, setCoursesRefresh] = useState(1);

  // Track if we've already fetched at least once (parity with useUser)
  const hasFetched = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const loadCourses = async () => {
      setCoursesLoading(true);
      setCoursesError(null);

      try {
        const params = new URLSearchParams({ limit: String(limit) });
        const res = await fetch(`/api/courses?${params.toString()}`);
        const data = await res.json();

        if (!cancelled) {
          if (res.ok && data.success) {
            setCourses(data.courses || []);
          } else {
            setCourses([]);
            setCoursesError(data.message || "Failed to load courses.");
          }
        }
      } catch (err) {
        console.error("Error loading courses:", err);
        if (!cancelled) {
          setCourses([]);
          setCoursesError("Network error while loading courses.");
        }
      } finally {
        if (!cancelled) {
          setCoursesLoading(false);
          hasFetched.current = true;
        }
      }
    };

    loadCourses();

    return () => {
      cancelled = true;
    };
  }, [limit, coursesRefresh]);

  return {
    courses,
    setCourses,
    coursesLoading,
    coursesError,
    coursesRefresh,
    setCoursesRefresh,
  };
};

export default useCourses;
