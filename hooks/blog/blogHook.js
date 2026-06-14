'use client'
import { useEffect, useRef, useState } from "react";

/**
 * Fetch the public blog listing from /api/blogs.
 *
 * The public endpoint only ever returns published posts (featured first), so
 * this hook is safe for the marketing blog page. State shape mirrors useCourses:
 * a loading flag, an error string, and a refresh counter to force a refetch.
 *
 * @param {object} [options]
 * @param {number} [options.limit=50] Max posts to request in one page.
 */
const useBlogs = ({ limit = 50 } = {}) => {
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [blogsError, setBlogsError] = useState(null);
  const [blogsRefresh, setBlogsRefresh] = useState(1);

  const hasFetched = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const loadBlogs = async () => {
      setBlogsLoading(true);
      setBlogsError(null);

      try {
        const params = new URLSearchParams({ limit: String(limit) });
        const res = await fetch(`/api/blogs?${params.toString()}`);
        const data = await res.json();

        if (!cancelled) {
          if (res.ok && data.success) {
            setBlogs(data.blogs || []);
          } else {
            setBlogs([]);
            setBlogsError(data.message || "Failed to load blogs.");
          }
        }
      } catch (err) {
        console.error("Error loading blogs:", err);
        if (!cancelled) {
          setBlogs([]);
          setBlogsError("Network error while loading blogs.");
        }
      } finally {
        if (!cancelled) {
          setBlogsLoading(false);
          hasFetched.current = true;
        }
      }
    };

    loadBlogs();

    return () => {
      cancelled = true;
    };
  }, [limit, blogsRefresh]);

  return {
    blogs,
    setBlogs,
    blogsLoading,
    blogsError,
    blogsRefresh,
    setBlogsRefresh,
  };
};

export default useBlogs;
