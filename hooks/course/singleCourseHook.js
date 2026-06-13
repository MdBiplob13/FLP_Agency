'use client'
import { useEffect, useRef, useState } from "react";

/**
 * Fetch a single public course from /api/courses/[id].
 *
 * The public GET endpoint returns any course by id (with teachers populated),
 * so this hook powers the course detail page. State shape mirrors useCourses:
 * the course doc, a loading flag, an error string, and a refresh counter.
 *
 * @param {string} id The course _id to load. When falsy the hook stays idle.
 */
const useCourse = (id) => {
  const [course, setCourse] = useState(null);
  const [courseLoading, setCourseLoading] = useState(Boolean(id));
  const [courseError, setCourseError] = useState(null);
  const [courseRefresh, setCourseRefresh] = useState(1);

  // Track if we've already fetched at least once (parity with useCourses)
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!id) {
      setCourse(null);
      setCourseLoading(false);
      return;
    }

    let cancelled = false;

    const loadCourse = async () => {
      setCourseLoading(true);
      setCourseError(null);

      try {
        const res = await fetch(`/api/courses/${id}`);
        const data = await res.json();

        if (!cancelled) {
          if (res.ok && data.success) {
            setCourse(data.course || null);
          } else {
            setCourse(null);
            setCourseError(data.message || "Failed to load course.");
          }
        }
      } catch (err) {
        console.error("Error loading course:", err);
        if (!cancelled) {
          setCourse(null);
          setCourseError("Network error while loading course.");
        }
      } finally {
        if (!cancelled) {
          setCourseLoading(false);
          hasFetched.current = true;
        }
      }
    };

    loadCourse();

    return () => {
      cancelled = true;
    };
  }, [id, courseRefresh]);

  return {
    course,
    setCourse,
    courseLoading,
    courseError,
    courseRefresh,
    setCourseRefresh,
  };
};

export default useCourse;
