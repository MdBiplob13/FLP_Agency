'use client';

// Shared course create/edit form fields. Used by both the "New course" modal on
// the admin courses grid and the Edit tab of the single course management page,
// so the ~100-line field set lives in exactly one place.
//
// This component renders ONLY the fields. The caller owns the <form> element,
// the submit button, and the surrounding chrome (modal vs. tab panel).

import {
  FiAward,
  FiHome,
} from 'react-icons/fi';
import CategoryInput from '@/app/components/dashboard/CategoryInput';

// Must match MAX_FEATURED_COURSES in models/courseModel.js
export const MAX_FEATURED_COURSES = 3;

// Mirror the course model enums
export const PRICE_TIERS = ['free', 'paid', 'discounted'];
export const LEVELS = ['beginner', 'intermediate', 'advanced'];
export const STATUSES = ['draft', 'published', 'archived'];

export const EMPTY_FORM = {
  title: '',
  description: '',
  category: '',
  priceTier: 'paid',
  price: 0,
  discountPrice: 0,
  level: 'beginner',
  language: 'Bangla',
  tags: '',
  thumbnail: '',
  enrollStartDate: '',
  enrollEndDate: '',
  courseStartDate: '',
  status: 'draft',
  isBestseller: false,
  isFeatured: false,
};

export const inputClass =
  'mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10';

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-300">{label}</span>
      {children}
    </label>
  );
}

/**
 * @param {object}   props
 * @param {object}   props.form         current form values
 * @param {Function} props.onField      (e) => void — generic name/value handler
 * @param {Function} props.setForm      setter for checkbox / CategoryInput updates
 * @param {Array}    props.categories   category suggestions for the autocomplete
 * @param {number}   props.featuredCount how many courses are already featured
 * @param {boolean}  props.editing      true in edit mode (relaxes the homepage cap UI)
 */
export default function CourseForm({
  form,
  onField,
  setForm,
  categories = [],
  featuredCount = 0,
  editing = false,
}) {
  const homepageFull = !form.isFeatured && featuredCount >= MAX_FEATURED_COURSES && !editing;

  return (
    <div className="space-y-5">
      <Field label="Title">
        <input name="title" value={form.title} onChange={onField} className={inputClass} placeholder="Full-Stack Developer Bootcamp" />
      </Field>

      <Field label="Description">
        <textarea name="description" rows={4} value={form.description} onChange={onField} className={inputClass} placeholder="What students will learn…" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <CategoryInput
          value={form.category}
          onChange={(name) => setForm((p) => ({ ...p, category: name }))}
          categories={categories}
        />
        <Field label="Language">
          <input name="language" value={form.language} onChange={onField} className={inputClass} placeholder="Bangla" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Price tier">
          <select name="priceTier" value={form.priceTier} onChange={onField} className={inputClass}>
            {PRICE_TIERS.map((t) => <option key={t} value={t} className="bg-slate-900 capitalize">{t}</option>)}
          </select>
        </Field>
        <Field label="Price (৳)">
          <input type="number" min="0" name="price" value={form.price} onChange={onField} className={inputClass} />
        </Field>
        <Field label="Discount (৳)">
          <input type="number" min="0" name="discountPrice" value={form.discountPrice} onChange={onField} className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Level">
          <select name="level" value={form.level} onChange={onField} className={inputClass}>
            {LEVELS.map((l) => <option key={l} value={l} className="bg-slate-900 capitalize">{l}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select name="status" value={form.status} onChange={onField} className={inputClass}>
            {STATUSES.map((s) => <option key={s} value={s} className="bg-slate-900 capitalize">{s}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Thumbnail URL">
        <input name="thumbnail" value={form.thumbnail} onChange={onField} className={inputClass} placeholder="https://…" />
      </Field>

      <Field label="Tags (comma separated)">
        <input name="tags" value={form.tags} onChange={onField} className={inputClass} placeholder="react, node, api" />
      </Field>

      {/* Enrollment window + class start — drive the public countdowns.
          Leave blank for an always-open course with no countdown. */}
      <div>
        <p className="text-sm font-medium text-slate-300">Enrollment &amp; start dates</p>
        <p className="mt-1 text-xs text-slate-500">
          Optional. Powers the countdowns; leave empty to keep a course always open.
        </p>
        <div className="mt-3 grid gap-5 sm:grid-cols-3">
          <Field label="Enroll opens">
            <input type="datetime-local" name="enrollStartDate" value={form.enrollStartDate} onChange={onField} className={inputClass} />
          </Field>
          <Field label="Enroll closes">
            <input type="datetime-local" name="enrollEndDate" value={form.enrollEndDate} onChange={onField} className={inputClass} />
          </Field>
          <Field label="Course starts">
            <input type="datetime-local" name="courseStartDate" value={form.courseStartDate} onChange={onField} className={inputClass} />
          </Field>
        </div>
      </div>

      {/* Marketing flags */}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3.5 transition-colors hover:border-amber-400/30">
          <input
            type="checkbox"
            checked={form.isBestseller}
            onChange={(e) => setForm((p) => ({ ...p, isBestseller: e.target.checked }))}
            className="mt-0.5 h-4 w-4 cursor-pointer accent-amber-500"
          />
          <span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
              <FiAward className="h-4 w-4 text-amber-300" /> Bestseller
            </span>
            <span className="mt-0.5 block text-xs text-slate-400">Show a bestseller badge on this course.</span>
          </span>
        </label>

        <label
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 transition-colors ${
            homepageFull
              ? 'cursor-not-allowed border-white/5 bg-white/[0.02] opacity-60'
              : 'cursor-pointer border-white/10 bg-slate-900/60 hover:border-blue-400/30'
          }`}
        >
          <input
            type="checkbox"
            checked={form.isFeatured}
            disabled={homepageFull}
            onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))}
            className="mt-0.5 h-4 w-4 cursor-pointer accent-blue-500"
          />
          <span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
              <FiHome className="h-4 w-4 text-blue-300" /> Show on homepage
            </span>
            <span className="mt-0.5 block text-xs text-slate-400">
              Feature on the homepage ({featuredCount}/{MAX_FEATURED_COURSES} used).
            </span>
          </span>
        </label>
      </div>
    </div>
  );
}
