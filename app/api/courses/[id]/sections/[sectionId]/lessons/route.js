import { requireCourseManager } from "@/lib/courseAccess";
import { addLesson } from "@/lib/courseContent";

// POST /api/courses/[id]/sections/[sectionId]/lessons — add a lesson (video)
export async function POST(request, { params }) {
  try {
    const { id, sectionId } = await params;
    const access = await requireCourseManager(request, id);
    if (access.error) {
      return Response.json({ success: false, message: access.error }, { status: access.status });
    }

    const { course } = access;
    const body = await request.json();
    const lesson = addLesson(course, sectionId, body);
    await course.save();

    return Response.json({ success: true, message: "Lesson added.", course, lesson }, { status: 201 });
  } catch (error) {
    const status = error.status || (error.name === "ValidationError" ? 400 : 500);
    if (status === 500) console.error("Lesson POST error:", error);
    return Response.json({ success: false, message: error.message || "Failed to add lesson." }, { status });
  }
}
