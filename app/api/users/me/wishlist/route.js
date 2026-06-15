import dbConnect from "@/lib/dbConnect";
import Course from "@/models/courseModel";
import { getAuthUser } from "@/lib/auth";

// GET /api/users/me/wishlist — the courses the current user has wishlisted.
//
// Mirrors /api/users/me/courses: we query by Course.inWishlistOf (a proper ref
// kept in sync by the toggle endpoint) rather than populating the user's plain
// `wishlist` array, so lesson counts, schedule, and teacher details all come
// back fully populated.
export async function GET(request) {
  try {
    const auth = await getAuthUser(request);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    await dbConnect();
    const courses = await Course.find({ inWishlistOf: auth.user._id })
      .sort({ createdAt: -1 })
      .populate("teachers", "name photo role")
      .lean();

    return Response.json({ success: true, courses }, { status: 200 });
  } catch (error) {
    console.error("My wishlist GET error:", error);
    return Response.json(
      { success: false, message: "Failed to load your wishlist." },
      { status: 500 }
    );
  }
}
