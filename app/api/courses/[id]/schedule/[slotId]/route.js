import { requireCourseManager } from "@/lib/courseAccess";
import { updateScheduleSlot, deleteScheduleSlot } from "@/lib/courseContent";

// PATCH /api/courses/[id]/schedule/[slotId] — update a scheduled class session
export async function PATCH(request, { params }) {
  try {
    const { id, slotId } = await params;
    const access = await requireCourseManager(request, id);
    if (access.error) {
      return Response.json({ success: false, message: access.error }, { status: access.status });
    }

    const { course } = access;
    const body = await request.json();
    const slot = updateScheduleSlot(course, slotId, body);
    await course.save();

    return Response.json({ success: true, message: "Class updated.", course, slot }, { status: 200 });
  } catch (error) {
    const status = error.status || (error.name === "ValidationError" ? 400 : 500);
    if (status === 500) console.error("Schedule PATCH error:", error);
    return Response.json({ success: false, message: error.message || "Failed to update class." }, { status });
  }
}

// DELETE /api/courses/[id]/schedule/[slotId] — remove a scheduled class session
export async function DELETE(request, { params }) {
  try {
    const { id, slotId } = await params;
    const access = await requireCourseManager(request, id);
    if (access.error) {
      return Response.json({ success: false, message: access.error }, { status: access.status });
    }

    const { course } = access;
    deleteScheduleSlot(course, slotId);
    await course.save();

    return Response.json({ success: true, message: "Class removed.", course }, { status: 200 });
  } catch (error) {
    const status = error.status || 500;
    if (status === 500) console.error("Schedule DELETE error:", error);
    return Response.json({ success: false, message: error.message || "Failed to remove class." }, { status });
  }
}
