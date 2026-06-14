'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiFileText,
  FiCheckCircle,
  FiEye,
  FiStar,
  FiSearch,
  FiLoader,
  FiAlertTriangle,
} from 'react-icons/fi';
import { authHeaders } from '@/lib/clientAuth';
import CategoryInput from '@/app/components/dashboard/CategoryInput';

const STATUSES = ['draft', 'published', 'archived'];

const EMPTY_FORM = {
  title: '',
  excerpt: '',
  content: '',
  category: '',
  tags: '',
  coverImage: '',
  status: 'draft',
  isFeatured: false,
};

const statusStyles = {
  draft: 'text-amber-300 bg-amber-500/10 ring-amber-500/20',
  published: 'text-emerald-300 bg-emerald-500/10 ring-emerald-500/20',
  archived: 'text-slate-400 bg-slate-500/10 ring-slate-500/20',
};

const inputClass =
  'mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10';

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Create / edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loadingForm, setLoadingForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Inline featured toggle — tracks which post is currently saving
  const [togglingId, setTogglingId] = useState(null);

  /* ---- Load blogs (admin view includes drafts) ---- */
  async function loadBlogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: statusFilter, limit: '50' });
      const res = await fetch(`/api/blogs?${params.toString()}`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        setBlogs(data.blogs || []);
      } else {
        toast.error(data.message || 'Failed to load blogs.');
      }
    } catch {
      toast.error('Network error while loading blogs.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Load categories once for the autocomplete suggestions
  async function loadCategories() {
    try {
      const res = await fetch('/api/categories?withCounts=true', { headers: authHeaders() });
      const data = await res.json();
      if (res.ok && data.success) setCategories(data.categories || []);
    } catch {
      // suggestions are non-critical; ignore failures
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  /* ---- Derived: client-side search + stats ---- */
  const filtered = useMemo(() => {
    if (!search.trim()) return blogs;
    const q = search.toLowerCase();
    return blogs.filter(
      (b) => b.title?.toLowerCase().includes(q) || b.category?.toLowerCase().includes(q)
    );
  }, [blogs, search]);

  const stats = useMemo(() => {
    const published = blogs.filter((b) => b.status === 'published').length;
    const views = blogs.reduce((sum, b) => sum + (b.views || 0), 0);
    return [
      { label: 'Total posts', value: blogs.length, icon: FiFileText },
      { label: 'Published', value: published, icon: FiCheckCircle },
      { label: 'Total views', value: views.toLocaleString(), icon: FiEye },
    ];
  }, [blogs]);

  /* ---- Modal helpers ---- */
  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  // The list view omits the post body, so fetch the full doc before editing.
  async function openEdit(blog) {
    setEditingId(blog._id);
    setForm({
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      content: '',
      category: blog.category || '',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
      coverImage: blog.coverImage || '',
      status: blog.status || 'draft',
      isFeatured: !!blog.isFeatured,
    });
    setModalOpen(true);
    setLoadingForm(true);
    try {
      const res = await fetch(`/api/blogs/${blog._id}`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok && data.success && data.blog) {
        setForm((p) => ({ ...p, content: data.blog.content || '' }));
      } else {
        toast.error(data.message || 'Failed to load the post body.');
      }
    } catch {
      toast.error('Network error while loading the post.');
    } finally {
      setLoadingForm(false);
    }
  }

  function handleField(e) {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim() || !form.category.trim()) {
      toast.error('Title, content and category are required.');
      return;
    }
    if (form.content.trim().length < 20) {
      toast.error('Content must be at least 20 characters.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const url = editingId ? `/api/blogs/${editingId}` : '/api/blogs';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to save blog.');
        return;
      }

      toast.success(editingId ? 'Blog updated.' : 'Blog created.');
      setModalOpen(false);
      loadBlogs();
      loadCategories();
    } catch {
      toast.error('Network error while saving.');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/blogs/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to delete blog.');
        return;
      }
      toast.success('Blog deleted.');
      setDeleteTarget(null);
      loadBlogs();
    } catch {
      toast.error('Network error while deleting.');
    } finally {
      setDeleting(false);
    }
  }

  /* ---- Inline featured toggle (only one post can be featured) ---- */
  async function toggleFeatured(blog) {
    const next = !blog.isFeatured;
    setTogglingId(blog._id);
    try {
      const res = await fetch(`/api/blogs/${blog._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ isFeatured: next }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to update blog.');
        return;
      }
      toast.success(next ? 'Pinned as featured post.' : 'Removed from featured.');
      // Reload so the single-featured invariant is reflected across all rows.
      loadBlogs();
    } catch {
      toast.error('Network error while updating.');
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div>
      {/* ---- Header ---- */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Blogs</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Blog management</h1>
          <p className="mt-2 text-slate-400">Write, publish, and manage blog posts.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110"
        >
          <FiPlus className="h-4 w-4" /> New post
        </button>
      </div>

      {/* ---- Stats ---- */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300 ring-1 ring-white/10">
              <s.icon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ---- Toolbar ---- */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative w-full max-w-sm">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts…"
            className="w-full rounded-full border border-white/10 bg-slate-900/80 py-2.5 pl-11 pr-4 text-sm text-white outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {['all', ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:border-blue-500/30 hover:text-blue-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ---- List ---- */}
      <div className="mt-6 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-3xl border border-white/10 bg-slate-950/60" />
          ))
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-slate-950/40 py-20 text-center">
            <FiFileText className="mx-auto h-10 w-10 text-slate-600" />
            <p className="mt-4 text-lg font-semibold text-white">No posts found</p>
            <p className="mt-1 text-sm text-slate-400">
              {blogs.length === 0 ? 'Create your first blog post to get started.' : 'Try a different search or filter.'}
            </p>
          </div>
        ) : (
          filtered.map((blog) => (
            <div
              key={blog._id}
              className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-4 sm:flex-row sm:items-center"
            >
              <div className="relative h-20 w-full flex-none overflow-hidden rounded-2xl sm:w-28">
                <img src={blog.coverImage || '/image1.jpg'} alt={blog.title} className="h-full w-full object-cover" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ${statusStyles[blog.status] || statusStyles.draft}`}>
                    {blog.status}
                  </span>
                  <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-blue-200 ring-1 ring-white/10">{blog.category}</span>
                  {blog.isFeatured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-300 ring-1 ring-amber-500/20">
                      <FiStar className="h-3 w-3 fill-amber-300" /> Featured
                    </span>
                  )}
                </div>
                <h3 className="mt-2 truncate text-lg font-semibold text-white">{blog.title}</h3>
                <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1"><FiEye className="h-3.5 w-3.5" /> {(blog.views || 0).toLocaleString()} views</span>
                  <span>{blog.author?.name || 'Unknown author'}</span>
                  <span>{formatDate(blog.createdAt)}</span>
                </p>
              </div>

              <div className="flex flex-none items-center gap-2">
                <button
                  onClick={() => toggleFeatured(blog)}
                  disabled={togglingId === blog._id}
                  title={blog.isFeatured ? 'Unfeature' : 'Feature on blog page'}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 transition-colors disabled:opacity-50 ${
                    blog.isFeatured
                      ? 'bg-amber-500/15 text-amber-300 ring-amber-500/30'
                      : 'bg-white/5 text-slate-400 ring-white/10 hover:text-amber-300'
                  }`}
                >
                  {togglingId === blog._id ? (
                    <FiLoader className="h-4 w-4 animate-spin" />
                  ) : (
                    <FiStar className={`h-4 w-4 ${blog.isFeatured ? 'fill-amber-300' : ''}`} />
                  )}
                </button>
                <button
                  onClick={() => openEdit(blog)}
                  title="Edit"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-300 ring-1 ring-white/10 transition-colors hover:text-blue-300"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(blog)}
                  title="Delete"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-300 ring-1 ring-white/10 transition-colors hover:text-rose-400"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ---- Create / edit modal ---- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0a0a12] p-6 shadow-2xl shadow-black/60 sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">{editingId ? 'Edit post' : 'New post'}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {editingId ? 'Update this blog post.' : 'Write and publish a new blog post.'}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 ring-1 ring-white/10 transition-colors hover:text-white"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-6 space-y-5">
              <label className="block">
                <span className="text-sm font-medium text-slate-300">Title</span>
                <input name="title" value={form.title} onChange={handleField} className={inputClass} placeholder="A great blog post title" />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-300">Excerpt <span className="text-slate-500">(optional)</span></span>
                <textarea name="excerpt" value={form.excerpt} onChange={handleField} rows={2} className={inputClass} placeholder="A short summary shown on cards. Left blank, it's taken from the content." />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-300">Content</span>
                <div className="relative">
                  <textarea
                    name="content"
                    value={form.content}
                    onChange={handleField}
                    rows={10}
                    className={inputClass}
                    placeholder="Write your post here… Line breaks are preserved."
                  />
                  {loadingForm && (
                    <span className="absolute right-3 top-5 inline-flex items-center gap-1.5 text-xs text-slate-400">
                      <FiLoader className="h-3.5 w-3.5 animate-spin" /> loading…
                    </span>
                  )}
                </div>
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <CategoryInput
                  value={form.category}
                  onChange={(v) => setForm((p) => ({ ...p, category: v }))}
                  categories={categories}
                />
                <label className="block">
                  <span className="text-sm font-medium text-slate-300">Tags <span className="text-slate-500">(comma separated)</span></span>
                  <input name="tags" value={form.tags} onChange={handleField} className={inputClass} placeholder="career, design, tips" />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-300">Cover image URL</span>
                <input name="coverImage" value={form.coverImage} onChange={handleField} className={inputClass} placeholder="https://… or /image1.jpg" />
              </label>

              <div className="grid items-end gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-300">Status</span>
                  <select name="status" value={form.status} onChange={handleField} className={`${inputClass} capitalize`}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-[#0a0a12] capitalize">{s}</option>
                    ))}
                  </select>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3">
                  <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleField} className="h-4 w-4 accent-blue-600" />
                  <span className="text-sm text-slate-300">Feature on blog page</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110 disabled:opacity-60"
                >
                  {saving ? <FiLoader className="h-4 w-4 animate-spin" /> : null}
                  {editingId ? 'Save changes' : 'Create post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- Delete confirmation ---- */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a12] p-6 shadow-2xl shadow-black/60">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20">
              <FiAlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-white">Delete this post?</h2>
            <p className="mt-2 text-sm text-slate-400">
              “{deleteTarget.title}” will be permanently removed. This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60"
              >
                {deleting ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiTrash2 className="h-4 w-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
