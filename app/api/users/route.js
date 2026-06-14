import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";
import { requireRole } from "@/lib/auth";

const ROLES = ["user", "teacher", "admin", "superadmin"];
const STATUSES = ["active", "inactive", "blocked"];

// GET /api/users — list platform users (admins & superadmins only)
export async function GET(request) {
  try {
    const auth = await requireRole(request, ["admin", "superadmin"]);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    const query = {};
    if (role && role !== "all" && ROLES.includes(role)) query.role = role;
    if (status && status !== "all" && STATUSES.includes(status)) query.status = status;
    if (search) {
      const rx = new RegExp(search.trim(), "i");
      query.$or = [{ name: rx }, { email: rx }, { phone: rx }];
    }

    const skip = (page - 1) * limit;

    // Role counts are computed over the WHOLE collection so the stat cards stay
    // accurate regardless of the current filter / page.
    const [users, total, roleAgg] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    ]);

    const roleCounts = roleAgg.reduce((acc, r) => {
      acc[r._id] = r.count;
      return acc;
    }, {});

    return Response.json(
      {
        success: true,
        users,
        roleCounts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Users GET error:", error);
    return Response.json({ success: false, message: "Failed to load users." }, { status: 500 });
  }
}
