'use client'
import { useEffect, useRef, useState } from "react";

/**
 * Fetch a single public teacher from /api/teachers/[id].
 *
 * The public GET endpoint returns an active teacher's public-safe fields plus
 * the published courses they lead, so this hook powers the teacher detail page.
 * State shape mirrors useCourse / useTeachers: the teacher doc, the courses
 * array, a loading flag, an error string, and a refresh counter.
 *
 * @param {string} id The teacher _id to load. When falsy the hook stays idle.
 */
const useTeacher = (id) => {
  const [teacher, setTeacher] = useState(null);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [teacherLoading, setTeacherLoading] = useState(Boolean(id));
  const [teacherError, setTeacherError] = useState(null);
  const [teacherRefresh, setTeacherRefresh] = useState(1);

  // Track if we've already fetched at least once (parity with useTeachers)
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!id) {
      setTeacher(null);
      setTeacherCourses([]);
      setTeacherLoading(false);
      return;
    }

    let cancelled = false;

    const loadTeacher = async () => {
      setTeacherLoading(true);
      setTeacherError(null);

      try {
        const res = await fetch(`/api/teachers/${id}`);
        const data = await res.json();

        if (!cancelled) {
          if (res.ok && data.success) {
            setTeacher(data.teacher || null);
            setTeacherCourses(data.courses || []);
          } else {
            setTeacher(null);
            setTeacherCourses([]);
            setTeacherError(data.message || "Failed to load teacher.");
          }
        }
      } catch (err) {
        console.error("Error loading teacher:", err);
        if (!cancelled) {
          setTeacher(null);
          setTeacherCourses([]);
          setTeacherError("Network error while loading teacher.");
        }
      } finally {
        if (!cancelled) {
          setTeacherLoading(false);
          hasFetched.current = true;
        }
      }
    };

    loadTeacher();

    return () => {
      cancelled = true;
    };
  }, [id, teacherRefresh]);

  return {
    teacher,
    teacherCourses,
    teacherLoading,
    teacherError,
    teacherRefresh,
    setTeacherRefresh,
  };
};

export default useTeacher;
