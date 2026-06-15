'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiX,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiLoader,
  FiCheck,
  FiPlayCircle,
  FiLock,
  FiLayers,
  FiCalendar,
  FiUsers,
  FiVideo,
  FiClock,
} from 'react-icons/fi';
import { authHeaders } from '@/lib/clientAuth';
import { toLocalInput, toIsoOrNull } from '@/lib/datetime';

const inputClass =
  'w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10';

const BATCH_STATUSES = ['upcoming', 'ongoing', 'completed'];

// Fire a mutation and return the parsed JSON, throwing on a failed response so
// callers can surface `error.message` via toast.
async function mutate(path, method, body) {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.message || 'Request failed.');
  return data;
}

const fmtDateTime = (v) =>
  v ? new Date(v).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '';

/* ================================================================== */
/*  Main modal                                                         */
/* ================================================================== */

export default function CourseContentModal({ course: initialCourse, onClose, onChange }) {
  const [course, setCourse] = useState(initialCourse);
  const [tab, setTab] = useState('curriculum');

  // Re-sync if the modal is reused for a different course
  useEffect(() => {
    setCourse(initialCourse);
  }, [initialCourse]);

  const courseId = course._id;

  // Apply a server response: update local + bubble up to the parent list.
  function applyCourse(updated) {
    setCourse(updated);
    onChange?.(updated);
  }

  const lessonCount = useMemo(
    () => (course.curriculum || []).reduce((n, s) => n + (s.lessons?.length || 0), 0),
    [course.curriculum],
  );

  const tabs = [
    { key: 'curriculum', label: 'Curriculum', icon: FiLayers, count: course.curriculum?.length || 0 },
    { key: 'schedule', label: 'Schedule', icon: FiCalendar, count: course.schedule?.length || 0 },
    { key: 'batch', label: 'Batch', icon: FiUsers },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8">
      <div className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0a0a12] shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white">Manage content</h2>
            <p className="mt-1 truncate text-sm text-slate-400">{course.title}</p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 flex-none cursor-pointer items-center justify-center rounded-full bg-white/5 text-slate-300 transition-colors hover:text-white"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 px-6 py-3">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white'
                    : 'border border-white/10 bg-white/5 text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
                {t.count != null && (
                  <span className={`rounded-full px-1.5 text-xs ${active ? 'bg-white/20' : 'bg-white/10 text-slate-400'}`}>
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="max-h-[68vh] space-y-6 overflow-y-auto px-6 py-6">
          {tab === 'curriculum' && (
            <CurriculumEditor courseId={courseId} sections={course.curriculum || []} apply={applyCourse} lessonCount={lessonCount} />
          )}
          {tab === 'schedule' && (
            <ScheduleEditor courseId={courseId} schedule={course.schedule || []} apply={applyCourse} />
          )}
          {tab === 'batch' && (
            <BatchEditor courseId={courseId} batch={course.currentBatch} apply={applyCourse} />
          )}
        </div>

        <div className="flex items-center justify-end border-t border-white/10 px-6 py-4">
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Curriculum (sections + lessons)                                    */
/* ================================================================== */

export function CurriculumEditor({ courseId, sections, apply, lessonCount }) {
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  async function addSection(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const data = await mutate(`/api/courses/${courseId}/sections`, 'POST', { title: newTitle.trim() });
      apply(data.course);
      setNewTitle('');
      toast.success('Section added.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={addSection} className="flex gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New section title (e.g. Module 1: Basics)"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={adding || !newTitle.trim()}
          className="inline-flex flex-none cursor-pointer items-center gap-1.5 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {adding ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiPlus className="h-4 w-4" />}
          Section
        </button>
      </form>

      {sections.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-slate-500">
          No sections yet. Add your first module above.
        </p>
      ) : (
        <p className="text-xs text-slate-500">
          {sections.length} sections · {lessonCount} lessons
        </p>
      )}

      {sections.map((section, i) => (
        <SectionRow key={section._id} courseId={courseId} section={section} index={i} apply={apply} />
      ))}
    </div>
  );
}

function SectionRow({ courseId, section, index, apply }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [busy, setBusy] = useState(false);

  async function saveTitle() {
    if (!title.trim()) return;
    setBusy(true);
    try {
      const data = await mutate(`/api/courses/${courseId}/sections/${section._id}`, 'PATCH', { title: title.trim() });
      apply(data.course);
      setEditing(false);
      toast.success('Section renamed.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeSection() {
    if (!confirm(`Delete section "${section.title}" and its lessons?`)) return;
    setBusy(true);
    try {
      const data = await mutate(`/api/courses/${courseId}/sections/${section._id}`, 'DELETE');
      apply(data.course);
      toast.success('Section deleted.');
    } catch (err) {
      toast.error(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
      <div className="flex items-center justify-between gap-3 border-b border-white/5 bg-white/5 px-4 py-3">
        {editing ? (
          <div className="flex flex-1 items-center gap-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} autoFocus />
            <button onClick={saveTitle} disabled={busy} className="inline-flex h-9 w-9 flex-none cursor-pointer items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50" aria-label="Save">
              {busy ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiCheck className="h-4 w-4" />}
            </button>
            <button onClick={() => { setEditing(false); setTitle(section.title); }} className="inline-flex h-9 w-9 flex-none cursor-pointer items-center justify-center rounded-lg bg-white/5 text-slate-300 hover:text-white" aria-label="Cancel">
              <FiX className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <h4 className="min-w-0 truncate font-semibold text-white">
              <span className="text-blue-300">{String(index + 1).padStart(2, '0')}.</span> {section.title}
            </h4>
            <div className="flex flex-none items-center gap-1.5">
              <span className="mr-1 text-xs text-slate-400">{section.lessons?.length || 0} lessons</span>
              <button onClick={() => setEditing(true)} className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/5 text-slate-300 hover:text-blue-200" aria-label="Rename section">
                <FiEdit2 className="h-3.5 w-3.5" />
              </button>
              <button onClick={removeSection} disabled={busy} className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-red-400/20 bg-red-500/10 text-red-300 hover:bg-red-500/20 disabled:opacity-50" aria-label="Delete section">
                {busy ? <FiLoader className="h-3.5 w-3.5 animate-spin" /> : <FiTrash2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="space-y-2 px-4 py-3">
        {(section.lessons || []).map((lesson) => (
          <LessonRow key={lesson._id} courseId={courseId} sectionId={section._id} lesson={lesson} apply={apply} />
        ))}
        <LessonForm courseId={courseId} sectionId={section._id} apply={apply} />
      </div>
    </div>
  );
}

function LessonRow({ courseId, sectionId, lesson, apply }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    try {
      const data = await mutate(`/api/courses/${courseId}/sections/${sectionId}/lessons/${lesson._id}`, 'DELETE');
      apply(data.course);
      toast.success('Lesson removed.');
    } catch (err) {
      toast.error(err.message);
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <LessonForm
        courseId={courseId}
        sectionId={sectionId}
        lesson={lesson}
        apply={apply}
        onDone={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        {lesson.isPreview ? <FiPlayCircle className="h-4 w-4 flex-none text-emerald-300" /> : <FiLock className="h-4 w-4 flex-none text-slate-500" />}
        <span className="truncate text-sm text-slate-200">{lesson.title}</span>
        {lesson.isPreview && <span className="flex-none rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-300">Preview</span>}
      </div>
      <div className="flex flex-none items-center gap-2">
        {lesson.duration ? <span className="text-xs text-slate-500">{lesson.duration}m</span> : null}
        <button onClick={() => setEditing(true)} className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/5 text-slate-300 hover:text-blue-200" aria-label="Edit lesson">
          <FiEdit2 className="h-3.5 w-3.5" />
        </button>
        <button onClick={remove} disabled={busy} className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-red-400/20 bg-red-500/10 text-red-300 hover:bg-red-500/20 disabled:opacity-50" aria-label="Delete lesson">
          {busy ? <FiLoader className="h-3.5 w-3.5 animate-spin" /> : <FiTrash2 className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

// Shared add/edit lesson form. `lesson` present → edit mode.
function LessonForm({ courseId, sectionId, lesson, apply, onDone }) {
  const editMode = !!lesson;
  const [form, setForm] = useState({
    title: lesson?.title || '',
    videoUrl: lesson?.videoUrl || '',
    duration: lesson?.duration || '',
    isPreview: !!lesson?.isPreview,
  });
  const [busy, setBusy] = useState(false);

  function field(e) {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setBusy(true);
    const payload = {
      title: form.title.trim(),
      videoUrl: form.videoUrl.trim(),
      duration: Number(form.duration) || 0,
      isPreview: form.isPreview,
    };
    try {
      const url = editMode
        ? `/api/courses/${courseId}/sections/${sectionId}/lessons/${lesson._id}`
        : `/api/courses/${courseId}/sections/${sectionId}/lessons`;
      const data = await mutate(url, editMode ? 'PATCH' : 'POST', payload);
      apply(data.course);
      toast.success(editMode ? 'Lesson updated.' : 'Lesson added.');
      if (editMode) onDone?.();
      else setForm({ title: '', videoUrl: '', duration: '', isPreview: false });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_90px]">
        <input name="title" value={form.title} onChange={field} placeholder="Lesson title" className={inputClass} />
        <label className="relative block">
          <FiVideo className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input name="videoUrl" value={form.videoUrl} onChange={field} placeholder="Video URL" className={`${inputClass} pl-9`} />
        </label>
        <label className="relative block">
          <FiClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input name="duration" type="number" min="0" value={form.duration} onChange={field} placeholder="min" className={`${inputClass} pl-9`} />
        </label>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-300">
          <input type="checkbox" name="isPreview" checked={form.isPreview} onChange={field} className="h-4 w-4 cursor-pointer accent-emerald-500" />
          Free preview
        </label>
        <div className="flex items-center gap-2">
          {editMode && (
            <button type="button" onClick={onDone} className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white">
              Cancel
            </button>
          )}
          <button type="submit" disabled={busy || !form.title.trim()} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600/90 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60">
            {busy ? <FiLoader className="h-3.5 w-3.5 animate-spin" /> : <FiPlus className="h-3.5 w-3.5" />}
            {editMode ? 'Save lesson' : 'Add lesson'}
          </button>
        </div>
      </div>
    </form>
  );
}

/* ================================================================== */
/*  Schedule (calendar-based class sessions)                           */
/* ================================================================== */

export function ScheduleEditor({ courseId, schedule, apply }) {
  const [form, setForm] = useState({ title: '', startDate: '' });
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', startDate: '' });

  const sorted = useMemo(
    () => [...schedule].sort((a, b) => new Date(a.startDate) - new Date(b.startDate)),
    [schedule],
  );

  async function add(e) {
    e.preventDefault();
    if (!form.startDate) {
      toast.error('Pick a class date & time.');
      return;
    }
    setBusy(true);
    try {
      const data = await mutate(`/api/courses/${courseId}/schedule`, 'POST', {
        title: form.title.trim(),
        startDate: toIsoOrNull(form.startDate),
      });
      apply(data.course);
      setForm({ title: '', startDate: '' });
      toast.success('Class scheduled.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  function startEdit(slot) {
    setEditingId(slot._id);
    setEditForm({ title: slot.title || '', startDate: toLocalInput(slot.startDate) });
  }

  async function saveEdit(slotId) {
    if (!editForm.startDate) {
      toast.error('Pick a class date & time.');
      return;
    }
    setBusy(true);
    try {
      const data = await mutate(`/api/courses/${courseId}/schedule/${slotId}`, 'PATCH', {
        title: editForm.title.trim(),
        startDate: toIsoOrNull(editForm.startDate),
      });
      apply(data.course);
      setEditingId(null);
      toast.success('Class updated.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(slotId) {
    setBusy(true);
    try {
      const data = await mutate(`/api/courses/${courseId}/schedule/${slotId}`, 'DELETE');
      apply(data.course);
      toast.success('Class removed.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={add} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
        <p className="text-sm font-medium text-slate-300">Schedule a class</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Title (optional, e.g. Live Q&A)"
            className={inputClass}
          />
          <input
            type="datetime-local"
            value={form.startDate}
            onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex flex-none cursor-pointer items-center gap-1.5 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiPlus className="h-4 w-4" /> Add
          </button>
        </div>
      </form>

      {sorted.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-slate-500">
          No classes scheduled yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((slot) => (
            <li key={slot._id} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
              {editingId === slot._id ? (
                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <input value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} placeholder="Title (optional)" className={inputClass} />
                  <input type="datetime-local" value={editForm.startDate} onChange={(e) => setEditForm((p) => ({ ...p, startDate: e.target.value }))} className={inputClass} />
                  <div className="flex items-center gap-2">
                    <button onClick={() => saveEdit(slot._id)} disabled={busy} className="inline-flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50">
                      {busy ? <FiLoader className="h-3.5 w-3.5 animate-spin" /> : <FiCheck className="h-3.5 w-3.5" />} Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg bg-white/5 px-3 text-xs font-semibold text-slate-300 hover:text-white">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <FiCalendar className="h-4 w-4 flex-none text-blue-300" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{slot.title || 'Class'}</p>
                      <p className="text-xs text-slate-400">{fmtDateTime(slot.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex flex-none items-center gap-1.5">
                    <button onClick={() => startEdit(slot)} className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/5 text-slate-300 hover:text-blue-200" aria-label="Edit class">
                      <FiEdit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => remove(slot._id)} disabled={busy} className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-red-400/20 bg-red-500/10 text-red-300 hover:bg-red-500/20 disabled:opacity-50" aria-label="Delete class">
                      <FiTrash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Batch                                                              */
/* ================================================================== */

export function BatchEditor({ courseId, batch, apply }) {
  const [form, setForm] = useState({
    name: batch?.name || '',
    seatCapacity: batch?.seatCapacity ?? '',
    status: batch?.status || 'upcoming',
    startDate: toLocalInput(batch?.startDate),
    endDate: toLocalInput(batch?.endDate),
  });
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Sync when the underlying batch changes (e.g. after Clear)
  useEffect(() => {
    setForm({
      name: batch?.name || '',
      seatCapacity: batch?.seatCapacity ?? '',
      status: batch?.status || 'upcoming',
      startDate: toLocalInput(batch?.startDate),
      endDate: toLocalInput(batch?.endDate),
    });
  }, [batch]);

  function field(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await mutate(`/api/courses/${courseId}/batch`, 'PUT', {
        name: form.name.trim(),
        seatCapacity: Number(form.seatCapacity) || 0,
        status: form.status,
        startDate: toIsoOrNull(form.startDate),
        endDate: toIsoOrNull(form.endDate),
      });
      apply(data.course);
      toast.success('Batch saved.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function clear() {
    if (!confirm('Clear the current batch?')) return;
    setClearing(true);
    try {
      const data = await mutate(`/api/courses/${courseId}/batch`, 'DELETE');
      apply(data.course);
      toast.success('Batch cleared.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setClearing(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-300">Batch name</span>
          <input name="name" value={form.name} onChange={field} placeholder="Batch 7" className={`${inputClass} mt-2`} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-300">Seat capacity</span>
          <input name="seatCapacity" type="number" min="0" value={form.seatCapacity} onChange={field} className={`${inputClass} mt-2`} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-300">Status</span>
          <select name="status" value={form.status} onChange={field} className={`${inputClass} mt-2`}>
            {BATCH_STATUSES.map((s) => (
              <option key={s} value={s} className="bg-slate-900 capitalize">{s}</option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <p className="text-sm text-slate-400">
            Enrolled: <span className="font-semibold text-white">{batch?.enrolledCount ?? 0}</span>
          </p>
        </div>
        <label className="block">
          <span className="text-sm font-medium text-slate-300">Batch starts</span>
          <input name="startDate" type="datetime-local" value={form.startDate} onChange={field} className={`${inputClass} mt-2`} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-300">Batch ends</span>
          <input name="endDate" type="datetime-local" value={form.endDate} onChange={field} className={`${inputClass} mt-2`} />
        </label>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-4">
        <button
          type="button"
          onClick={clear}
          disabled={clearing || !batch}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {clearing ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiTrash2 className="h-4 w-4" />}
          Clear batch
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiCheck className="h-4 w-4" />}
          Save batch
        </button>
      </div>
    </form>
  );
}
