import { requireCourseManager } from "@/lib/courseAccess";
import { updateSection, deleteSection } from "@/lib/courseContent";

// PATCH /api/courses/[id]/sections/[sectionId] — rename / update a section
export async function PATCH(request, { params }) {
  try {
    const { id, sectionId } = await params;
    const access = await requireCourseManager(request, id);
    if (access.error) {
      return Response.json({ success: false, message: access.error }, { status: access.status });
    }

    const { course } = access;
    const body = await request.json();
    const section = updateSection(course, sectionId, body);
    await course.save();

    return Response.json({ success: true, message: "Section updated.", course, section }, { status: 200 });
  } catch (error) {
    const status = error.status || (error.name === "ValidationError" ? 400 : 500);
    if (status === 500) console.error("Section PATCH error:", error);
    return Response.json({ success: false, message: error.message || "Failed to update section." }, { status });
  }
}

// DELETE /api/courses/[id]/sections/[sectionId] — remove a section (and its lessons)
export async function DELETE(request, { params }) {
  try {
    const { id, sectionId } = await params;
    const access = await requireCourseManager(request, id);
    if (access.error) {
      return Response.json({ success: false, message: access.error }, { status: access.status });
    }

    const { course } = access;
    deleteSection(course, sectionId);
    await course.save();

    return Response.json({ success: true, message: "Section deleted.", course }, { status: 200 });
  } catch (error) {
    const status = error.status || 500;
    if (status === 500) console.error("Section DELETE error:", error);
    return Response.json({ success: false, message: error.message || "Failed to delete section." }, { status });
  }
}
