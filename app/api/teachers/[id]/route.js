import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";
import Course from "@/models/courseModel";
import { requireRole } from "@/lib/auth";

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/teachers/[id] — public single teacher profile.
//
// Returns only active teachers (public-safe fields) alongside the published
// courses they lead, which powers the teacher detail page's course rail.
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return Response.json({ success: false, message: "Invalid teacher id." }, { status: 400 });
    }

    await dbConnect();

    const teacher = await User.findOne({ _id: id, role: "teacher", status: "active" })
      .select("name photo role address socialLinks isFeatured createdAt")
      .lean();

    if (!teacher) {
      return Response.json({ success: false, message: "Teacher not found." }, { status: 404 });
    }

    const courses = await Course.find({ teachers: id, status: "published" })
      .select("title thumbnail category level priceTier price discountPrice studentsEnrolled createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({ success: true, teacher, courses }, { status: 200 });
  } catch (error) {
    console.error("Teacher GET error:", error);
    return Response.json({ success: false, message: "Failed to load teacher." }, { status: 500 });
  }
}

// PATCH /api/teachers/[id] — manage a teacher's marketing flags (admins only).
//
// Currently supports a single "featured" teacher across the whole platform:
// setting isFeatured=true clears the flag on every other teacher first, so at
// most one teacher is ever featured at a time.
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return Response.json({ success: false, message: "Invalid teacher id." }, { status: 400 });
    }

    const auth = await requireRole(request, ["admin", "superadmin"]);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    await dbConnect();
    const teacher = await User.findById(id);
    if (!teacher || teacher.role !== "teacher") {
      return Response.json({ success: false, message: "Teacher not found." }, { status: 404 });
    }

    const body = await request.json();
    if (typeof body.isFeatured !== "boolean") {
      return Response.json(
        { success: false, message: "isFeatured (boolean) is required." },
        { status: 400 }
      );
    }

    if (body.isFeatured) {
      // Only ONE featured teacher at a time — clear it on everyone else first.
      await User.updateMany(
        { role: "teacher", _id: { $ne: teacher._id }, isFeatured: true },
        { $set: { isFeatured: false } }
      );
      teacher.isFeatured = true;
    } else {
      teacher.isFeatured = false;
    }

    await teacher.save();

    const safe = teacher.toObject();
    delete safe.password;

    return Response.json(
      {
        success: true,
        message: body.isFeatured ? "Featured teacher updated." : "Featured teacher cleared.",
        teacher: safe,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Teacher PATCH error:", error);
    return Response.json({ success: false, message: "Failed to update teacher." }, { status: 500 });
  }
}
