'use client'
import { useEffect, useRef, useState } from "react";

/**
 * Fetch a single public blog post from /api/blogs/[id].
 *
 * The public GET endpoint returns a published post (with its author populated)
 * alongside a few related posts, so this hook powers the blog detail page.
 * State shape mirrors useCourse: the blog doc, the related array, a loading
 * flag, an error string, and a refresh counter.
 *
 * @param {string} id The blog _id to load. When falsy the hook stays idle.
 */
const useBlog = (id) => {
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [blogLoading, setBlogLoading] = useState(Boolean(id));
  const [blogError, setBlogError] = useState(null);
  const [blogRefresh, setBlogRefresh] = useState(1);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!id) {
      setBlog(null);
      setRelatedBlogs([]);
      setBlogLoading(false);
      return;
    }

    let cancelled = false;

    const loadBlog = async () => {
      setBlogLoading(true);
      setBlogError(null);

      try {
        const res = await fetch(`/api/blogs/${id}`);
        const data = await res.json();

        if (!cancelled) {
          if (res.ok && data.success) {
            setBlog(data.blog || null);
            setRelatedBlogs(data.related || []);
          } else {
            setBlog(null);
            setRelatedBlogs([]);
            setBlogError(data.message || "Failed to load blog.");
          }
        }
      } catch (err) {
        console.error("Error loading blog:", err);
        if (!cancelled) {
          setBlog(null);
          setRelatedBlogs([]);
          setBlogError("Network error while loading blog.");
        }
      } finally {
        if (!cancelled) {
          setBlogLoading(false);
          hasFetched.current = true;
        }
      }
    };

    loadBlog();

    return () => {
      cancelled = true;
    };
  }, [id, blogRefresh]);

  return {
    blog,
    relatedBlogs,
    blogLoading,
    blogError,
    blogRefresh,
    setBlogRefresh,
  };
};

export default useBlog;
