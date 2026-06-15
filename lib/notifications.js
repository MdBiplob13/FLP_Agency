// Notification fan-out helpers.
//
// These create one Notification document per recipient. They are BEST-EFFORT:
// a failure to write notifications must never break the primary action (a
// signup, an enrollment, …), so every helper swallows its own errors and logs.
//
// Callers are responsible for `dbConnect()` already having run — every route
// that triggers a notification has connected to the DB by the time it calls in.

import Notification from "@/models/notificationModel";
import User from "@/models/userModel";

// Roles that receive admin-facing event notifications. Teachers are excluded by
// design — they manage courses but don't get the platform activity feed.
const ADMIN_ROLES = ["admin", "superadmin"];

/**
 * Insert one notification per recipient id, de-duping ids. Returns the count.
 */
async function fanOut(recipientIds, payload) {
  const ids = [...new Set((recipientIds || []).map((id) => String(id)))];
  if (ids.length === 0) return 0;

  const docs = ids.map((recipient) => ({ ...payload, recipient }));
  const created = await Notification.insertMany(docs, { ordered: false });
  return created.length;
}

/**
 * Notify every admin / superadmin of a platform event.
 * `payload` = { type, title, body?, link?, course?, actor? }.
 */
export async function notifyAdmins(payload) {
  try {
    const admins = await User.find({ role: { $in: ADMIN_ROLES } })
      .select("_id")
      .lean();
    return await fanOut(
      admins.map((a) => a._id),
      payload,
    );
  } catch (err) {
    console.error("notifyAdmins failed:", err);
    return 0;
  }
}

/**
 * Notify an explicit list of users (ids or docs with _id).
 */
export async function notifyUsers(recipients, payload) {
  try {
    const ids = (recipients || []).map((r) => r?._id || r);
    return await fanOut(ids, payload);
  } catch (err) {
    console.error("notifyUsers failed:", err);
    return 0;
  }
}

/**
 * Notify every student enrolled in a course. `course` is a loaded course doc
 * (with `studentsEnrolled`). `excludeId` skips one user (e.g. the actor).
 */
export async function notifyCourseStudents(course, payload, excludeId = null) {
  try {
    const students = (course?.studentsEnrolled || []).filter(
      (s) => !excludeId || String(s) !== String(excludeId),
    );
    return await fanOut(students, payload);
  } catch (err) {
    console.error("notifyCourseStudents failed:", err);
    return 0;
  }
}
