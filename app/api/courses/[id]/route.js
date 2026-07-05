import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Course, { MAX_FEATURED_COURSES } from "@/models/courseModel";
import User from "@/models/userModel";
import { requireRole } from "@/lib/auth";
import { ensureCategory } from "@/lib/categories";
import { slugify } from "@/lib/slug";

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function findCourseByIdentifier(identifier) {
  if (!identifier) return null;

  await dbConnect();

  const query = isValidId(identifier)
    ? { _id: identifier }
    : { slug: identifier };

  const course = await Course.findOne(query)
    .populate("teachers", "name photo role socialLinks")
    .lean();

  if (course?.slug) return course;

  if (course && !course.slug) {
    const generatedSlug = slugify(course.title || "");
    if (generatedSlug) {
      await Course.updateOne({ _id: course._id }, { $set: { slug: generatedSlug } });
      course.slug = generatedSlug;
    }
  }

  return course;
}

// GET /api/courses/[id] — public single course
export async function GET(request, { params }) {
  try {
    // In this Next.js version, params is a Promise and must be awaited
    const { id } = await params;
    if (!id?.trim()) {
      return Response.json({ success: false, message: "Invalid course id." }, { status: 400 });
    }

    const course = await findCourseByIdentifier(id);

    if (!course) {
      return Response.json({ success: false, message: "Course not found." }, { status: 404 });
    }

    return Response.json({ success: true, course }, { status: 200 });
  } catch (error) {
    console.error("Course GET error:", error);
    return Response.json({ success: false, message: "Failed to load course." }, { status: 500 });
  }
}

// PATCH /api/courses/[id] — update (teacher who owns it, or admin)
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return Response.json({ success: false, message: "Invalid course id." }, { status: 400 });
    }

    const auth = await requireRole(request, ["teacher", "admin", "superadmin"]);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    await dbConnect();
    const course = await Course.findById(id);
    if (!course) {
      return Response.json({ success: false, message: "Course not found." }, { status: 404 });
    }

    // Teachers may only edit their own courses; admins may edit any
    const isAdmin = ["admin", "superadmin"].includes(auth.user.role);
    const isOwner = course.teachers.some((t) => t.equals(auth.user._id));
    if (!isAdmin && !isOwner) {
      return Response.json(
        { success: false, message: "You can only edit your own courses." },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Turning on "featured" is capped: only MAX_FEATURED_COURSES may be pinned
    // to the homepage at once. Check before applying so we can reject cleanly.
    if (body.isFeatured === true && !course.isFeatured) {
      const featuredCount = await Course.countDocuments({
        isFeatured: true,
        _id: { $ne: course._id },
      });
      if (featuredCount >= MAX_FEATURED_COURSES) {
        return Response.json(
          {
            success: false,
            message: `Only ${MAX_FEATURED_COURSES} courses can be featured on the homepage. Unfeature one first.`,
          },
          { status: 409 }
        );
      }
    }

    // Whitelist updatable fields — never trust the client with relations/counters
    const updatable = [
      "title", "description", "category", "priceTier", "price", "discountPrice",
      "level", "language", "tags", "thumbnail", "curriculum", "schedule",
      "currentBatch", "enrollStartDate", "enrollEndDate", "courseStartDate",
      "status", "isBestseller", "isFeatured", "isHidden",
    ];
    for (const key of updatable) {
      if (key in body) course[key] = body[key];
    }

    // Invariant: a hidden course can't simultaneously be a bestseller or pinned
    // to the homepage. Check the resulting state so it holds no matter which
    // flag the request flipped (hide a featured course, or feature a hidden one).
    if (course.isHidden && (course.isBestseller || course.isFeatured)) {
      return Response.json(
        {
          success: false,
          message: "A bestseller or homepage course can't be hidden. Remove those flags first.",
        },
        { status: 409 }
      );
    }

    // `teachers` is a relation, so it's handled explicitly instead of via the
    // blind whitelist above: accept an array of user ids, keep only the ones
    // that are real teachers, and store them as the course's instructor set.
    if ("slug" in body && body.slug?.trim()) {
      course.slug = body.slug.trim().toLowerCase();
    }

    if ("teachers" in body) {
      if (!Array.isArray(body.teachers)) {
        return Response.json(
          { success: false, message: "teachers must be an array of teacher ids." },
          { status: 400 }
        );
      }
      const ids = body.teachers.filter((tid) => isValidId(tid));
      const validTeachers = await User.find({ _id: { $in: ids }, role: "teacher" })
        .select("_id")
        .lean();
      course.teachers = validTeachers.map((t) => t._id);
    }

    // If the category changed to a new one, register it and use canonical name
    if ("category" in body && body.category?.trim()) {
      const categoryDoc = await ensureCategory(body.category);
      course.category = categoryDoc ? categoryDoc.name : body.category.trim();
    }

    await course.save();
    return Response.json(
      { success: true, message: "Course updated.", course },
      { status: 200 }
    );
  } catch (error) {
    if (error?.name === "ValidationError") {
      return Response.json({ success: false, message: error.message }, { status: 400 });
    }
    console.error("Course PATCH error:", error);
    return Response.json({ success: false, message: "Failed to update course." }, { status: 500 });
  }
}

// DELETE /api/courses/[id] — remove (owner teacher or admin)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return Response.json({ success: false, message: "Invalid course id." }, { status: 400 });
    }

    const auth = await requireRole(request, ["teacher", "admin", "superadmin"]);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    await dbConnect();
    const course = await Course.findById(id);
    if (!course) {
      return Response.json({ success: false, message: "Course not found." }, { status: 404 });
    }

    const isAdmin = ["admin", "superadmin"].includes(auth.user.role);
    const isOwner = course.teachers.some((t) => t.equals(auth.user._id));
    if (!isAdmin && !isOwner) {
      return Response.json(
        { success: false, message: "You can only delete your own courses." },
        { status: 403 }
      );
    }

    await course.deleteOne();
    return Response.json({ success: true, message: "Course deleted." }, { status: 200 });
  } catch (error) {
    console.error("Course DELETE error:", error);
    return Response.json({ success: false, message: "Failed to delete course." }, { status: 500 });
  }
}
