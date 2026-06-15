// Shared, client-safe helpers for <input type="datetime-local"> fields.
// Pure functions — no React, no 'use client' needed.

/**
 * Convert a stored ISO date (or Date) to the value a datetime-local input
 * expects ("YYYY-MM-DDTHH:mm"), expressed in the user's local time.
 * Returns "" for empty/invalid input.
 */
export function toLocalInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}

/**
 * Convert a datetime-local string back to an unambiguous ISO instant for the
 * API. Returns null when blank so a date field can be cleared.
 */
export function toIsoOrNull(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
