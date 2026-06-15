import { requireCourseManager } from "@/lib/courseAccess";
import { updateLesson, deleteLesson } from "@/lib/courseContent";

// PATCH /api/courses/[id]/sections/[sectionId]/lessons/[lessonId] — update a lesson
export async function PATCH(request, { params }) {
  try {
    const { id, sectionId, lessonId } = await params;
    const access = await requireCourseManager(request, id);
    if (access.error) {
      return Response.json({ success: false, message: access.error }, { status: access.status });
    }

    const { course } = access;
    const body = await request.json();
    const lesson = updateLesson(course, sectionId, lessonId, body);
    await course.save();

    return Response.json({ success: true, message: "Lesson updated.", course, lesson }, { status: 200 });
  } catch (error) {
    const status = error.status || (error.name === "ValidationError" ? 400 : 500);
    if (status === 500) console.error("Lesson PATCH error:", error);
    return Response.json({ success: false, message: error.message || "Failed to update lesson." }, { status });
  }
}

// DELETE /api/courses/[id]/sections/[sectionId]/lessons/[lessonId] — delete a lesson
export async function DELETE(request, { params }) {
  try {
    const { id, sectionId, lessonId } = await params;
    const access = await requireCourseManager(request, id);
    if (access.error) {
      return Response.json({ success: false, message: access.error }, { status: access.status });
    }

    const { course } = access;
    deleteLesson(course, sectionId, lessonId);
    await course.save();

    return Response.json({ success: true, message: "Lesson deleted.", course }, { status: 200 });
  } catch (error) {
    const status = error.status || 500;
    if (status === 500) console.error("Lesson DELETE error:", error);
    return Response.json({ success: false, message: error.message || "Failed to delete lesson." }, { status });
  }
}
