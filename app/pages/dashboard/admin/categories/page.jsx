'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiTag,
  FiSearch,
  FiLoader,
  FiAlertTriangle,
  FiBookOpen,
} from 'react-icons/fi';
import { authHeaders } from '@/lib/clientAuth';

const inputClass =
  'mt-2 w-full rounded-2xl border border-border bg-surface-elevated/80 px-4 py-3 text-sm text-text outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create / edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadCategories() {
    setLoading(true);
    try {
      const res = await fetch('/api/categories?withCounts=true', { headers: authHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        setCategories(data.categories || []);
      } else {
        toast.error(data.message || 'Failed to load categories.');
      }
    } catch {
      toast.error('Network error while loading categories.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, search]);

  function openCreate() {
    setEditingId(null);
    setForm({ name: '', description: '' });
    setModalOpen(true);
  }

  function openEdit(cat) {
    setEditingId(cat._id);
    setForm({ name: cat.name || '', description: cat.description || '' });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ name: form.name.trim(), description: form.description.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to save category.');
        return;
      }

      toast.success(editingId ? 'Category updated.' : 'Category created.');
      setModalOpen(false);
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
      const res = await fetch(`/api/categories/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        // Surfaces the "published courses still use this" guard message
        toast.error(data.message || 'Failed to delete category.');
        return;
      }
      toast.success('Category deleted.');
      setDeleteTarget(null);
      loadCategories();
    } catch {
      toast.error('Network error while deleting.');
    } finally {
      setDeleting(false);
    }
  }

  // A category is locked from deletion while published courses use it
  const lockedFromDelete = (cat) => (cat.publishedCount || 0) > 0;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-primary">Categories</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-text">Category management</h1>
          <p className="mt-2 text-text-muted">Add, rename, and remove course categories.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-linear-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:brightness-110"
        >
          <FiPlus className="h-4 w-4" /> New category
        </button>
      </div>

      {/* Search */}
      <div className="mt-10">
        <label className="relative block w-full sm:max-w-xs">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-subtle" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories…"
            className="w-full rounded-full border border-border bg-surface-elevated/80 py-3 pl-12 pr-4 text-sm text-text outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
          />
        </label>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-surface">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-text-muted">
            <FiLoader className="h-5 w-5 animate-spin" /> Loading categories…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <FiTag className="mx-auto h-10 w-10 text-text-subtle" />
            <p className="mt-4 text-lg font-semibold text-text">No categories yet</p>
            <p className="mt-1 text-text-muted">Create one, or add a course with a new category.</p>
            <button
              onClick={openCreate}
              className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full border border-border-strong bg-surface-muted px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:border-primary/40 hover:text-primary"
            >
              <FiPlus className="h-4 w-4" /> New category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Courses</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => {
                  const locked = lockedFromDelete(c);
                  return (
                    <tr key={c._id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-border">
                            <FiTag className="h-4 w-4" />
                          </span>
                          <span className="font-semibold text-text">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-muted">
                        {c.description ? (
                          <span className="line-clamp-1">{c.description}</span>
                        ) : (
                          <span className="text-text-subtle">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-text-muted">
                          <FiBookOpen className="h-3.5 w-3.5 text-text-subtle" />
                          {c.courseCount || 0}
                          {c.publishedCount > 0 && (
                            <span className="ml-1 rounded-full bg-success/10 px-2 py-0.5 text-xs text-success ring-1 ring-emerald-500/20">
                              {c.publishedCount} live
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(c)}
                            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border bg-surface-muted text-text-muted transition-colors hover:border-primary/40 hover:text-primary"
                            aria-label="Edit category"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => !locked && setDeleteTarget(c)}
                            disabled={locked}
                            title={locked ? 'Has published courses — cannot delete' : 'Delete category'}
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                              locked
                                ? 'cursor-not-allowed border-border bg-white/[0.02] text-text-subtle'
                                : 'cursor-pointer border-danger/20 bg-danger/10 text-danger hover:bg-danger/20'
                            }`}
                            aria-label="Delete category"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---- Create / Edit modal ---- */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-surface-elevated shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <h2 className="text-lg font-semibold text-text">
                {editingId ? 'Edit category' : 'Create category'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-surface-muted text-text-muted transition-colors hover:text-text"
                aria-label="Close"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 px-6 py-6">
              <label className="block">
                <span className="text-sm font-medium text-text-muted">Name</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className={inputClass}
                  placeholder="Web Development"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-text-muted">Description (optional)</span>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className={inputClass}
                  placeholder="Short description of this category…"
                />
              </label>

              {editingId && (
                <p className="rounded-2xl border border-amber-400/20 bg-warning/10 px-4 py-3 text-xs leading-5 text-amber-200">
                  Renaming updates this category on every course currently using it.
                </p>
              )}

              <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="cursor-pointer rounded-full border border-border-strong bg-surface-muted px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-linear-to-r from-primary to-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving && <FiLoader className="h-4 w-4 animate-spin" />}
                  {saving ? 'Saving…' : editingId ? 'Update category' : 'Create category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- Delete confirmation ---- */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-surface-elevated p-7 shadow-2xl shadow-black/50">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-red-500/15 text-danger ring-1 ring-red-400/20">
                <FiAlertTriangle className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-text">Delete category?</h3>
                <p className="mt-1 text-sm leading-6 text-text-muted">
                  “{deleteTarget.name}” will be removed. Courses keep their category text but it will
                  no longer appear in suggestions.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="cursor-pointer rounded-full border border-border-strong bg-surface-muted px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:text-primary"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deleting && <FiLoader className="h-4 w-4 animate-spin" />}
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
