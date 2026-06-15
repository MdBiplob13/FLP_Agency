import dbConnect from "@/lib/dbConnect";
import Course from "@/models/courseModel";
import { getAuthUser } from "@/lib/auth";

// GET /api/users/me/courses — the courses the current user is enrolled in.
//
// We query by Course.studentsEnrolled (a proper ref kept in sync by the enroll
// endpoint) rather than populating the user's plain `courses` array, so lesson
// counts, schedule, and teacher details all come back fully populated.
export async function GET(request) {
  try {
    const auth = await getAuthUser(request);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    await dbConnect();
    const courses = await Course.find({ studentsEnrolled: auth.user._id })
      .sort({ createdAt: -1 })
      .populate("teachers", "name photo role")
      .lean();

    return Response.json({ success: true, courses }, { status: 200 });
  } catch (error) {
    console.error("My courses GET error:", error);
    return Response.json(
      { success: false, message: "Failed to load your courses." },
      { status: 500 }
    );
  }
}
