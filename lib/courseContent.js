// Pure mutation helpers for a course's nested content: curriculum (sections →
// lessons), schedule sessions, and the current batch.
//
// Each function operates on an already-loaded Mongoose course document, mutates
// it in place, and returns the affected subdocument. They never call `.save()` —
// the API route is responsible for persisting and for auth/loading. On a
// not-found / bad-input condition they throw an `httpError`, an Error carrying a
// `.status` so the route can map it to the right HTTP code.

/** Build an Error tagged with an HTTP status for the route to surface. */
export function httpError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function getSection(course, sectionId) {
  const section = course.curriculum.id(sectionId);
  if (!section) throw httpError("Section not found.", 404);
  return section;
}

/* ----------------------------- Sections ----------------------------- */

export function addSection(course, { title } = {}) {
  if (!title || !title.trim()) throw httpError("Section title is required.");
  course.curriculum.push({ title: title.trim(), lessons: [] });
  return course.curriculum[course.curriculum.length - 1];
}

export function updateSection(course, sectionId, { title } = {}) {
  const section = getSection(course, sectionId);
  if (title !== undefined) {
    if (!title.trim()) throw httpError("Section title cannot be empty.");
    section.title = title.trim();
  }
  return section;
}

export function deleteSection(course, sectionId) {
  const section = getSection(course, sectionId);
  section.deleteOne();
  return { _id: sectionId };
}

/* ------------------------------ Lessons ----------------------------- */

export function addLesson(course, sectionId, fields = {}) {
  const section = getSection(course, sectionId);
  const { title, videoUrl, duration, isPreview } = fields;
  if (!title || !title.trim()) throw httpError("Lesson title is required.");

  section.lessons.push({
    title: title.trim(),
    videoUrl: videoUrl?.trim() || "",
    duration: Number(duration) || 0,
    isPreview: !!isPreview,
  });
  return section.lessons[section.lessons.length - 1];
}

export function updateLesson(course, sectionId, lessonId, fields = {}) {
  const section = getSection(course, sectionId);
  const lesson = section.lessons.id(lessonId);
  if (!lesson) throw httpError("Lesson not found.", 404);

  if (fields.title !== undefined) {
    if (!fields.title.trim()) throw httpError("Lesson title cannot be empty.");
    lesson.title = fields.title.trim();
  }
  if (fields.videoUrl !== undefined) lesson.videoUrl = fields.videoUrl?.trim() || "";
  if (fields.duration !== undefined) lesson.duration = Number(fields.duration) || 0;
  if (fields.isPreview !== undefined) lesson.isPreview = !!fields.isPreview;
  return lesson;
}

export function deleteLesson(course, sectionId, lessonId) {
  const section = getSection(course, sectionId);
  const lesson = section.lessons.id(lessonId);
  if (!lesson) throw httpError("Lesson not found.", 404);
  lesson.deleteOne();
  return { _id: lessonId };
}

/* ----------------------------- Schedule ----------------------------- */

function parseDate(value, label = "Date") {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw httpError(`${label} is invalid.`);
  return d;
}

export function addScheduleSlot(course, { title, startDate } = {}) {
  if (!startDate) throw httpError("A class date & time is required.");
  course.schedule.push({
    title: title?.trim() || "",
    startDate: parseDate(startDate, "Class date"),
  });
  return course.schedule[course.schedule.length - 1];
}

export function updateScheduleSlot(course, slotId, fields = {}) {
  const slot = course.schedule.id(slotId);
  if (!slot) throw httpError("Schedule session not found.", 404);
  if (fields.title !== undefined) slot.title = fields.title?.trim() || "";
  if (fields.startDate !== undefined) slot.startDate = parseDate(fields.startDate, "Class date");
  return slot;
}

export function deleteScheduleSlot(course, slotId) {
  const slot = course.schedule.id(slotId);
  if (!slot) throw httpError("Schedule session not found.", 404);
  slot.deleteOne();
  return { _id: slotId };
}

/* ------------------------------- Batch ------------------------------ */

// Fields an admin may set on the batch. `enrolledCount` is intentionally
// excluded — it's maintained by the enroll/un-enroll endpoints.
const BATCH_STATUSES = ["upcoming", "ongoing", "completed"];

export function setBatch(course, fields = {}) {
  const next = course.currentBatch
    ? course.currentBatch.toObject()
    : { enrolledCount: 0 };

  if (fields.name !== undefined) next.name = fields.name?.trim() || "";
  if (fields.seatCapacity !== undefined) next.seatCapacity = Number(fields.seatCapacity) || 0;
  if (fields.status !== undefined) {
    if (!BATCH_STATUSES.includes(fields.status)) throw httpError("Invalid batch status.");
    next.status = fields.status;
  }
  if (fields.startDate !== undefined) {
    next.startDate = fields.startDate ? parseDate(fields.startDate, "Batch start") : undefined;
  }
  if (fields.endDate !== undefined) {
    next.endDate = fields.endDate ? parseDate(fields.endDate, "Batch end") : undefined;
  }

  course.currentBatch = next;
  return course.currentBatch;
}

export function clearBatch(course) {
  course.currentBatch = null;
  return null;
}
