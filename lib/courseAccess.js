import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Course from "@/models/courseModel";
import { requireRole } from "@/lib/auth";

export function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Authorize a course-management request and load the target course.
 *
 * Mirrors the admin-or-owner rule used by the course PATCH/DELETE handlers:
 * admins/superadmins may manage any course; teachers may manage only courses
 * they're assigned to.
 *
 * @returns {Promise<{ course: any, auth: any } | { error: string, status: number }>}
 */
export async function requireCourseManager(request, id) {
  if (!isValidId(id)) {
    return { error: "Invalid course id.", status: 400 };
  }

  const auth = await requireRole(request, ["teacher", "admin", "superadmin"]);
  if (auth.error) {
    return { error: auth.error, status: auth.status };
  }

  await dbConnect();
  const course = await Course.findById(id);
  if (!course) {
    return { error: "Course not found.", status: 404 };
  }

  const isAdmin = ["admin", "superadmin"].includes(auth.user.role);
  const isOwner = course.teachers.some((t) => t.equals(auth.user._id));
  if (!isAdmin && !isOwner) {
    return { error: "You can only manage your own courses.", status: 403 };
  }

  return { course, auth };
}
