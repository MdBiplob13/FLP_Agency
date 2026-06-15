import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Course from "@/models/courseModel";
import { requireRole } from "@/lib/auth";
import { notifyCourseStudents } from "@/lib/notifications";

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/courses/[id]/announce — the course's announcement history (newest
// first). Admin / superadmin only.
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return Response.json({ success: false, message: "Invalid course id." }, { status: 400 });
    }

    const auth = await requireRole(request, ["admin", "superadmin"]);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    await dbConnect();
    const course = await Course.findById(id)
      .select("title announcements studentsEnrolled")
      .populate("announcements.sentBy", "name photo")
      .lean();
    if (!course) {
      return Response.json({ success: false, message: "Course not found." }, { status: 404 });
    }

    const announcements = [...(course.announcements || [])].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return Response.json(
      {
        success: true,
        announcements,
        studentCount: (course.studentsEnrolled || []).length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Announcements GET error:", error);
    return Response.json({ success: false, message: "Failed to load announcements." }, { status: 500 });
  }
}

// POST /api/courses/[id]/announce — send an announcement to every enrolled
// student. Admin / superadmin only. Stores it on the course and fans out an
// in-app notification to each student.
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return Response.json({ success: false, message: "Invalid course id." }, { status: 400 });
    }

    const auth = await requireRole(request, ["admin", "superadmin"]);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const body = await request.json().catch(() => ({}));
    const title = (body.title || "").trim();
    const message = (body.body || "").trim();
    if (!title) {
      return Response.json({ success: false, message: "An announcement title is required." }, { status: 400 });
    }

    await dbConnect();
    const course = await Course.findById(id);
    if (!course) {
      return Response.json({ success: false, message: "Course not found." }, { status: 404 });
    }

    const studentCount = (course.studentsEnrolled || []).length;

    // Notify every enrolled student. Best-effort: a notify failure shouldn't
    // block recording the announcement.
    await notifyCourseStudents(course, {
      type: "announcement",
      title: `${course.title}: ${title}`,
      body: message,
      link: "/pages/dashboard/user",
      course: course._id,
      actor: auth.user._id,
    });

    course.announcements.push({
      title,
      body: message,
      sentBy: auth.user._id,
      recipientCount: studentCount,
    });
    await course.save();

    const announcement = course.announcements[course.announcements.length - 1];

    return Response.json(
      {
        success: true,
        message:
          studentCount > 0
            ? `Announcement sent to ${studentCount} student${studentCount === 1 ? "" : "s"}.`
            : "Announcement saved. No students are enrolled yet.",
        announcement,
        recipientCount: studentCount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Announcements POST error:", error);
    return Response.json({ success: false, message: "Failed to send announcement." }, { status: 500 });
  }
}
