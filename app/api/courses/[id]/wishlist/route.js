import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Course from "@/models/courseModel";
import User from "@/models/userModel";
import { getAuthUser } from "@/lib/auth";

// POST /api/courses/[id]/wishlist — toggle the course in the user's wishlist
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
    const inWishlist = course.inWishlistOf.some((u) => u.equals(userId));

    if (inWishlist) {
      // Remove from wishlist (both sides)
      course.inWishlistOf = course.inWishlistOf.filter((u) => !u.equals(userId));
      await course.save();
      await User.findByIdAndUpdate(userId, { $pull: { wishlist: course._id } });
      return Response.json(
        { success: true, message: "Removed from wishlist.", wishlisted: false },
        { status: 200 }
      );
    }

    course.inWishlistOf.push(userId);
    await course.save();
    await User.findByIdAndUpdate(userId, { $addToSet: { wishlist: course._id } });
    return Response.json(
      { success: true, message: "Added to wishlist.", wishlisted: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Wishlist error:", error);
    return Response.json({ success: false, message: "Failed to update wishlist." }, { status: 500 });
  }
}
