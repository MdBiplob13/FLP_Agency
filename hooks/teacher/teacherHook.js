'use client'
import { useEffect, useRef, useState } from "react";

/**
 * Fetch the public teacher list from /api/teachers.
 *
 * The public endpoint only returns active teachers and sorts the featured one
 * first. State shape mirrors useCourses: a loading flag, an error string, and a
 * refresh counter to force a refetch.
 *
 * @param {object} [options]
 * @param {number} [options.limit=100] Max teachers to request.
 * @param {boolean} [options.featured] When true, only the featured teacher(s).
 */
const useTeachers = ({ limit = 100, featured = false } = {}) => {
  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [teachersError, setTeachersError] = useState(null);
  const [teachersRefresh, setTeachersRefresh] = useState(1);

  const hasFetched = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const loadTeachers = async () => {
      setTeachersLoading(true);
      setTeachersError(null);

      try {
        const params = new URLSearchParams({ limit: String(limit) });
        if (featured) params.set("featured", "true");
        const res = await fetch(`/api/teachers?${params.toString()}`);
        const data = await res.json();

        if (!cancelled) {
          if (res.ok && data.success) {
            setTeachers(data.teachers || []);
          } else {
            setTeachers([]);
            setTeachersError(data.message || "Failed to load teachers.");
          }
        }
      } catch (err) {
        console.error("Error loading teachers:", err);
        if (!cancelled) {
          setTeachers([]);
          setTeachersError("Network error while loading teachers.");
        }
      } finally {
        if (!cancelled) {
          setTeachersLoading(false);
          hasFetched.current = true;
        }
      }
    };

    loadTeachers();

    return () => {
      cancelled = true;
    };
  }, [limit, featured, teachersRefresh]);

  return {
    teachers,
    setTeachers,
    teachersLoading,
    teachersError,
    teachersRefresh,
    setTeachersRefresh,
  };
};

export default useTeachers;
