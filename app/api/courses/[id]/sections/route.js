import { requireCourseManager } from "@/lib/courseAccess";
import { addSection } from "@/lib/courseContent";

// POST /api/courses/[id]/sections — add a curriculum section (module)
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const access = await requireCourseManager(request, id);
    if (access.error) {
      return Response.json({ success: false, message: access.error }, { status: access.status });
    }

    const { course } = access;
    const body = await request.json();
    const section = addSection(course, body);
    await course.save();

    return Response.json(
      { success: true, message: "Section added.", course, section },
      { status: 201 }
    );
  } catch (error) {
    const status = error.status || (error.name === "ValidationError" ? 400 : 500);
    if (status === 500) console.error("Section POST error:", error);
    return Response.json({ success: false, message: error.message || "Failed to add section." }, { status });
  }
}
