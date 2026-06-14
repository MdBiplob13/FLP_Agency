import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";
import { requireRole } from "@/lib/auth";

// Roles an admin/superadmin may assign through this endpoint. "superadmin" is
// intentionally excluded — it is seeded, never granted via the dashboard.
const ASSIGNABLE_ROLES = ["user", "teacher", "admin"];
const STATUSES = ["active", "inactive", "blocked"];
const ELEVATED = ["admin", "superadmin"];

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// PATCH /api/users/[id] — change a user's role and/or status.
//
// Privilege rules:
//   • admin  → may promote/demote between "user" and "teacher", and manage the
//     status of non-elevated accounts.
//   • superadmin → may additionally grant/remove the "admin" role and manage
//     admin-level accounts.
//   • No one may change their OWN role/status here (prevents self-lockout).
//   • A "superadmin" account can only be touched by a superadmin.
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return Response.json({ success: false, message: "Invalid user id." }, { status: 400 });
    }

    const auth = await requireRole(request, ["admin", "superadmin"]);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }
    const isSuperadmin = auth.user.role === "superadmin";

    await dbConnect();
    const target = await User.findById(id);
    if (!target) {
      return Response.json({ success: false, message: "User not found." }, { status: 404 });
    }

    // Guard: never edit yourself through the admin panel
    if (target._id.equals(auth.user._id)) {
      return Response.json(
        { success: false, message: "You cannot change your own role or status." },
        { status: 403 }
      );
    }

    // Guard: a superadmin account is off-limits to ordinary admins
    if (target.role === "superadmin" && !isSuperadmin) {
      return Response.json(
        { success: false, message: "Only a superadmin can manage a superadmin account." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updates = {};

    /* ---- Role change ---- */
    if ("role" in body) {
      const role = body.role;
      if (!ASSIGNABLE_ROLES.includes(role)) {
        return Response.json(
          { success: false, message: "Invalid or non-assignable role." },
          { status: 400 }
        );
      }
      // Granting OR removing an admin-level role requires superadmin
      const touchesElevated = ELEVATED.includes(role) || ELEVATED.includes(target.role);
      if (touchesElevated && !isSuperadmin) {
        return Response.json(
          { success: false, message: "Only a superadmin can assign or remove the admin role." },
          { status: 403 }
        );
      }
      updates.role = role;
    }

    /* ---- Status change ---- */
    if ("status" in body) {
      const status = body.status;
      if (!STATUSES.includes(status)) {
        return Response.json({ success: false, message: "Invalid status." }, { status: 400 });
      }
      // Changing the status of an admin-level account requires superadmin
      if (ELEVATED.includes(target.role) && !isSuperadmin) {
        return Response.json(
          { success: false, message: "Only a superadmin can change an admin's status." },
          { status: 403 }
        );
      }
      updates.status = status;
    }

    if (!Object.keys(updates).length) {
      return Response.json(
        { success: false, message: "No valid fields to update." },
        { status: 400 }
      );
    }

    Object.assign(target, updates);
    await target.save();

    const safe = target.toObject();
    delete safe.password;

    return Response.json({ success: true, message: "User updated.", user: safe }, { status: 200 });
  } catch (error) {
    if (error?.name === "ValidationError") {
      return Response.json({ success: false, message: error.message }, { status: 400 });
    }
    console.error("User PATCH error:", error);
    return Response.json({ success: false, message: "Failed to update user." }, { status: 500 });
  }
}
