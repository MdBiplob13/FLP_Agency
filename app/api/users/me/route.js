import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";
import { getAuthUser } from "@/lib/auth";

// GET /api/users/me — current user's full profile with populated relations
export async function GET(request) {
  try {
    const auth = await getAuthUser(request);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    await dbConnect();
    const user = await User.findById(auth.user._id)
      .select("-password")
      .populate("courses", "title thumbnail category priceTier price")
      .populate("wishlist", "title thumbnail category priceTier price")
      .lean();

    return Response.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("Profile GET error:", error);
    return Response.json({ success: false, message: "Failed to load profile." }, { status: 500 });
  }
}

// PATCH /api/users/me — update the current user's own profile
export async function PATCH(request) {
  try {
    const auth = await getAuthUser(request);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    // Users may only change profile fields — never email, role, status, courses.
    // Email is deliberately excluded: it's the login identity and isn't editable.
    const updatable = ["name", "phone", "photo", "address", "socialLinks"];
    const updates = {};
    for (const key of updatable) {
      if (key in body) updates[key] = body[key];
    }

    if (!Object.keys(updates).length) {
      return Response.json(
        { success: false, message: "No valid fields to update." },
        { status: 400 }
      );
    }

    await dbConnect();
    const user = await User.findByIdAndUpdate(auth.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    return Response.json(
      { success: true, message: "Profile updated.", user },
      { status: 200 }
    );
  } catch (error) {
    if (error?.name === "ValidationError") {
      return Response.json({ success: false, message: error.message }, { status: 400 });
    }
    console.error("Profile PATCH error:", error);
    return Response.json({ success: false, message: "Failed to update profile." }, { status: 500 });
  }
}
