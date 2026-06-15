import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Course from "@/models/courseModel";
import User from "@/models/userModel";
import { getAuthUser } from "@/lib/auth";
import { requireCourseManager } from "@/lib/courseAccess";
import { notifyAdmins } from "@/lib/notifications";

// GET /api/courses/[id]/wishlist — the users who wishlisted this course.
//
// Manager-only (admin/superadmin, or a teacher who owns the course): powers the
// admin dashboard "who added this to their wishlist" view. Returns a count plus
// the list of users with just the fields the UI shows.
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const result = await requireCourseManager(request, id);
    if (result.error) {
      return Response.json(
        { success: false, message: result.error },
        { status: result.status }
      );
    }

    // requireCourseManager loaded the course; populate just the wishlist users.
    await result.course.populate("inWishlistOf", "name email photo role createdAt");
    const users = result.course.inWishlistOf || [];

    return Response.json(
      { success: true, count: users.length, users },
      { status: 200 }
    );
  } catch (error) {
    console.error("Wishlist users GET error:", error);
    return Response.json(
      { success: false, message: "Failed to load wishlist users." },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/wishlist — toggle the course in the user's wishlist
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ success: false, message: "Invalid course id." }, { status: 400 });
    }

    const auth = await getAuthUser(request);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    await dbConnect();
    const course = await Course.findById(id);
    if (!course) {
      return Response.json({ success: false, message: "Course not found." }, { status: 404 });
    }

    const userId = auth.user._id;
    const inWishlist = course.inWishlistOf.some((u) => u.equals(userId));

    if (inWishlist) {
      // Remove from wishlist (both sides)
      course.inWishlistOf = course.inWishlistOf.filter((u) => !u.equals(userId));
      await course.save();
      await User.findByIdAndUpdate(userId, { $pull: { wishlist: course._id } });
      return Response.json(
        { success: true, message: "Removed from wishlist.", wishlisted: false },
        { status: 200 }
      );
    }

    course.inWishlistOf.push(userId);
    await course.save();
    await User.findByIdAndUpdate(userId, { $addToSet: { wishlist: course._id } });

    // Let admins know a course is gaining wishlist interest (best-effort).
    await notifyAdmins({
      type: "wishlist",
      title: "Course wishlisted",
      body: `${auth.user.name} added "${course.title}" to their wishlist.`,
      link: `/pages/dashboard/admin/courses/${course._id}`,
      course: course._id,
      actor: userId,
    });

    return Response.json(
      { success: true, message: "Added to wishlist.", wishlisted: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Wishlist error:", error);
    return Response.json({ success: false, message: "Failed to update wishlist." }, { status: 500 });
  }
}
