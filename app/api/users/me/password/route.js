import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";
import { getAuthUser } from "@/lib/auth";

// PATCH /api/users/me/password — change the current user's own password.
//
// Requires the current password for verification. The user document is loaded
// WITH the password hash here (getAuthUser strips it) so we can compare.
export async function PATCH(request) {
  try {
    const auth = await getAuthUser(request);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return Response.json(
        { success: false, message: "Current and new password are required." },
        { status: 400 }
      );
    }

    if (String(newPassword).length < 8) {
      return Response.json(
        { success: false, message: "New password must be at least 8 characters." },
        { status: 400 }
      );
    }

    await dbConnect();
    const user = await User.findById(auth.user._id);
    if (!user) {
      return Response.json({ success: false, message: "User no longer exists." }, { status: 404 });
    }

    const matches = await bcrypt.compare(String(currentPassword), user.password);
    if (!matches) {
      return Response.json(
        { success: false, message: "Current password is incorrect." },
        { status: 400 }
      );
    }

    // Reject a no-op change so the user gets clear feedback.
    const sameAsOld = await bcrypt.compare(String(newPassword), user.password);
    if (sameAsOld) {
      return Response.json(
        { success: false, message: "New password must be different from the current one." },
        { status: 400 }
      );
    }

    user.password = await bcrypt.hash(String(newPassword), 10);
    await user.save();

    return Response.json({ success: true, message: "Password updated." }, { status: 200 });
  } catch (error) {
    console.error("Password PATCH error:", error);
    return Response.json({ success: false, message: "Failed to update password." }, { status: 500 });
  }
}
