import { requireCourseManager } from "@/lib/courseAccess";
import { addScheduleSlot } from "@/lib/courseContent";
import { notifyCourseStudents } from "@/lib/notifications";

// POST /api/courses/[id]/schedule — add a scheduled class session (date + time)
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const access = await requireCourseManager(request, id);
    if (access.error) {
      return Response.json({ success: false, message: access.error }, { status: access.status });
    }

    const { course } = access;
    const body = await request.json();
    const slot = addScheduleSlot(course, body);
    await course.save();

    // Tell enrolled students a new class was scheduled (best-effort).
    const when = new Date(slot.startDate).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    await notifyCourseStudents(course, {
      type: "schedule",
      title: `New class scheduled in ${course.title}`,
      body: `${slot.title || "Class"} — ${when}.`,
      link: `/pages/dashboard/user/learn/${course._id}`,
      course: course._id,
    });

    return Response.json({ success: true, message: "Class scheduled.", course, slot }, { status: 201 });
  } catch (error) {
    const status = error.status || (error.name === "ValidationError" ? 400 : 500);
    if (status === 500) console.error("Schedule POST error:", error);
    return Response.json({ success: false, message: error.message || "Failed to schedule class." }, { status });
  }
}
