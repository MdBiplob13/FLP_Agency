// Course enrollment / start-date timing — the single source of truth for the
// public countdowns and for whether enrollment is currently allowed.
//
// A course is driven by three optional dates:
//   - enrollStartDate: when enrollment opens
//   - enrollEndDate:   when enrollment closes
//   - courseStartDate: when classes begin
//
// Phases (evaluated in priority order against `now`):
//   before-enroll  now < enrollStartDate            "Enrollment starts in …"   (can't enroll)
//   enroll-open    enrollStart ≤ now < enrollEnd    "Enrollment closes in …"   (can enroll)
//   enroll-closed  enrollEnd ≤ now < courseStart    "Course starts in …"       (can't enroll)
//   started        now ≥ courseStartDate            no countdown               (can't enroll)
//   open           no usable dates set              no countdown               (can enroll)
//
// Courses with no dates fall through to `open`, preserving the original
// "always enrollable, no countdown" behavior.

function toTime(value) {
  if (!value) return null;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? null : t;
}

/**
 * Resolve a course's current timing state.
 *
 * @param {object} course - course doc/shape with the three date fields
 * @param {number} [now]  - epoch ms (defaults to current time)
 * @returns {{ phase: string, target: number|null, label: string, canEnroll: boolean, started: boolean }}
 */
export function getCourseTiming(course = {}, now = Date.now()) {
  const enrollStart = toTime(course.enrollStartDate);
  const enrollEnd = toTime(course.enrollEndDate);
  const courseStart = toTime(course.courseStartDate);

  if (enrollStart !== null && now < enrollStart) {
    return {
      phase: "before-enroll",
      target: enrollStart,
      label: "Enrollment starts in",
      canEnroll: false,
      started: false,
    };
  }

  if (enrollEnd !== null && now < enrollEnd) {
    return {
      phase: "enroll-open",
      target: enrollEnd,
      label: "Enrollment closes in",
      canEnroll: true,
      started: false,
    };
  }

  if (courseStart !== null && now < courseStart) {
    return {
      phase: "enroll-closed",
      target: courseStart,
      label: "Course starts in",
      canEnroll: false,
      started: false,
    };
  }

  if (courseStart !== null && now >= courseStart) {
    return {
      phase: "started",
      target: null,
      label: "Course in progress",
      canEnroll: false,
      started: true,
    };
  }

  // No usable dates — behave as an always-open course.
  return {
    phase: "open",
    target: null,
    label: "",
    canEnroll: true,
    started: false,
  };
}

/**
 * Break a positive millisecond span into days / hours / minutes / seconds.
 * Negative or zero spans clamp to all zeros.
 */
export function formatRemaining(ms) {
  const total = Math.max(0, Math.floor((ms || 0) / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}
