import { requireCourseManager } from "@/lib/courseAccess";
import { setBatch, clearBatch } from "@/lib/courseContent";

// PUT /api/courses/[id]/batch — set / merge the course's current batch
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const access = await requireCourseManager(request, id);
    if (access.error) {
      return Response.json({ success: false, message: access.error }, { status: access.status });
    }

    const { course } = access;
    const body = await request.json();
    const batch = setBatch(course, body);
    await course.save();

    return Response.json({ success: true, message: "Batch saved.", course, batch }, { status: 200 });
  } catch (error) {
    const status = error.status || (error.name === "ValidationError" ? 400 : 500);
    if (status === 500) console.error("Batch PUT error:", error);
    return Response.json({ success: false, message: error.message || "Failed to save batch." }, { status });
  }
}

// DELETE /api/courses/[id]/batch — clear the current batch
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const access = await requireCourseManager(request, id);
    if (access.error) {
      return Response.json({ success: false, message: access.error }, { status: access.status });
    }

    const { course } = access;
    clearBatch(course);
    await course.save();

    return Response.json({ success: true, message: "Batch cleared.", course }, { status: 200 });
  } catch (error) {
    const status = error.status || 500;
    if (status === 500) console.error("Batch DELETE error:", error);
    return Response.json({ success: false, message: error.message || "Failed to clear batch." }, { status });
  }
}
