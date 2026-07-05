'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FiPlusCircle, FiTag } from 'react-icons/fi';

const inputClass =
  'mt-2 w-full rounded-2xl border border-border bg-surface-elevated/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10';

/**
 * Category text input with a live suggestion dropdown.
 * - `value` / `onChange(string)` control the typed category name.
 * - `categories` is the list of existing { name } docs loaded by the parent.
 * Shows matching existing categories as you type, and signals when the typed
 * value would create a brand-new category.
 */
export default function CategoryInput({ value, onChange, categories = [] }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    function onClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const query = value.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!query) return categories.slice(0, 8);
    return categories
      .filter((c) => c.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [categories, query]);

  // Does the typed value exactly match an existing category (case-insensitive)?
  const exactExists = useMemo(
    () => categories.some((c) => c.name.toLowerCase() === query),
    [categories, query]
  );

  const isNew = query.length > 0 && !exactExists;

  function pick(name) {
    onChange(name);
    setOpen(false);
  }

  return (
    <label className="relative block" ref={wrapRef}>
      <span className="text-sm font-medium text-text-muted">Category</span>
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
        className={inputClass}
        placeholder="Web Development"
      />

      {/* "Will be created" hint */}
      {isNew && !open && (
        <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-success">
          <FiPlusCircle className="h-3.5 w-3.5" /> New category — will be added
        </span>
      )}

      {/* Suggestion dropdown */}
      {open && (matches.length > 0 || isNew) && (
        <div className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-border bg-surface-elevated py-1.5 shadow-2xl shadow-black/50">
          {matches.map((c) => (
            <button
              key={c._id || c.name}
              type="button"
              onClick={() => pick(c.name)}
              className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm text-text transition-colors hover:bg-surface-muted"
            >
              <FiTag className="h-4 w-4 text-primary" />
              <span className="flex-1 truncate">{c.name}</span>
              {typeof c.courseCount === 'number' && (
                <span className="text-xs text-text-subtle">{c.courseCount}</span>
              )}
            </button>
          ))}

          {isNew && (
            <button
              type="button"
              onClick={() => pick(value.trim())}
              className="flex w-full cursor-pointer items-center gap-2.5 border-t border-border px-4 py-2.5 text-left text-sm text-success transition-colors hover:bg-success/10"
            >
              <FiPlusCircle className="h-4 w-4" />
              <span className="flex-1 truncate">Create “{value.trim()}”</span>
              <span className="text-xs text-success/70">new</span>
            </button>
          )}
        </div>
      )}
    </label>
  );
}
