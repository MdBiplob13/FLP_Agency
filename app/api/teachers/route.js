import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";

// GET /api/teachers — public list of active teachers
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    const query = { role: "teacher", status: "active" };
    if (featured === "true") query.isFeatured = true;
    if (search) {
      const rx = new RegExp(search.trim(), "i");
      query.$or = [{ name: rx }, { address: rx }];
    }

    // Only expose public-safe fields. Featured teachers surface first.
    const teachers = await User.find(query)
      .select("name photo role address socialLinks isFeatured createdAt")
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return Response.json(
      { success: true, teachers, count: teachers.length },
      { status: 200 }
    );
  } catch (error) {
    console.error("Teachers GET error:", error);
    return Response.json({ success: false, message: "Failed to load teachers." }, { status: 500 });
  }
}
