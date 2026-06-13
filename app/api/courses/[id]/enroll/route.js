import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Course from "@/models/courseModel";
import User from "@/models/userModel";
import { getAuthUser } from "@/lib/auth";

// POST /api/courses/[id]/enroll — enroll the current user in a course
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ success: false, message: "Invalid course id." }, { status: 400 });
    }

    const auth = await getAuthUser(request);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    await dbConnect();
    const course = await Course.findById(id);
    if (!course) {
      return Response.json({ success: false, message: "Course not found." }, { status: 404 });
    }

    const userId = auth.user._id;
    const alreadyEnrolled = course.studentsEnrolled.some((s) => s.equals(userId));
    if (alreadyEnrolled) {
      return Response.json(
        { success: false, message: "You are already enrolled in this course." },
        { status: 409 }
      );
    }

    // Keep both sides of the relation in sync
    course.studentsEnrolled.push(userId);
    if (course.currentBatch && typeof course.currentBatch.enrolledCount === "number") {
      course.currentBatch.enrolledCount += 1;
    }
    await course.save();

    await User.findByIdAndUpdate(userId, { $addToSet: { courses: course._id } });

    return Response.json(
      { success: true, message: "Enrolled successfully.", courseId: course._id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Enroll error:", error);
    return Response.json({ success: false, message: "Failed to enroll." }, { status: 500 });
  }
}

// DELETE /api/courses/[id]/enroll — un-enroll the current user
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ success: false, message: "Invalid course id." }, { status: 400 });
    }

    const auth = await getAuthUser(request);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    await dbConnect();
    const course = await Course.findById(id);
    if (!course) {
      return Response.json({ success: false, message: "Course not found." }, { status: 404 });
    }

    const userId = auth.user._id;
    const wasEnrolled = course.studentsEnrolled.some((s) => s.equals(userId));
    if (!wasEnrolled) {
      return Response.json(
        { success: false, message: "You are not enrolled in this course." },
        { status: 409 }
      );
    }

    course.studentsEnrolled = course.studentsEnrolled.filter((s) => !s.equals(userId));
    if (course.currentBatch && course.currentBatch.enrolledCount > 0) {
      course.currentBatch.enrolledCount -= 1;
    }
    await course.save();

    await User.findByIdAndUpdate(userId, { $pull: { courses: course._id } });

    return Response.json(
      { success: true, message: "Un-enrolled successfully.", courseId: course._id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Un-enroll error:", error);
    return Response.json({ success: false, message: "Failed to un-enroll." }, { status: 500 });
  }
}
