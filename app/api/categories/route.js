import dbConnect from "@/lib/dbConnect";
import Category from "@/models/categoryModel";
import Course from "@/models/courseModel";
import { requireRole } from "@/lib/auth";
import { ensureCategory } from "@/lib/categories";

// GET /api/categories — public list, optionally with per-category course counts
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const withCounts = searchParams.get("withCounts") === "true";

    const query = {};
    if (search) query.name = new RegExp(search.trim(), "i");

    const categories = await Category.find(query).sort({ name: 1 }).lean();

    if (!withCounts) {
      return Response.json(
        { success: true, categories, count: categories.length },
        { status: 200 },
      );
    }

    // Attach total + published course counts per category (matched by name)
    const withCount = await Promise.all(
      categories.map(async (cat) => {
        const [total, published] = await Promise.all([
          Course.countDocuments({ category: cat.name }),
          Course.countDocuments({ category: cat.name, status: "published" }),
        ]);
        return { ...cat, courseCount: total, publishedCount: published };
      }),
    );

    return Response.json(
      { success: true, categories: withCount, count: withCount.length },
      { status: 200 },
    );
  } catch (error) {
    console.error("Categories GET error:", error);
    return Response.json(
      { success: false, message: "Failed to load categories." },
      { status: 500 },
    );
  }
}

// POST /api/categories — create a category (admins only)
export async function POST(request) {
  try {
    const auth = await requireRole(request, ["admin", "superadmin"]);
    if (auth.error) {
      return Response.json(
        { success: false, message: auth.error },
        { status: auth.status },
      );
    }

    const { name, description } = await request.json();
    if (!name || !name.trim()) {
      return Response.json(
        { success: false, message: "Category name is required." },
        { status: 400 },
      );
    }

    await dbConnect();

    // Reject duplicates (case-insensitive)
    const slug = name.trim().toLowerCase();
    const existing = await Category.findOne({ slug });
    if (existing) {
      return Response.json(
        {
          success: false,
          message: "A category with this name already exists.",
        },
        { status: 409 },
      );
    }

    const category = await Category.create({ name, description, slug });

    return Response.json(
      { success: true, message: "Category created.", category },
      { status: 201 },
    );
  } catch (error) {
    if (error?.name === "ValidationError") {
      return Response.json(
        { success: false, message: error.message },
        { status: 400 },
      );
    }
    console.error("Categories POST error:", error);
    return Response.json(
      { success: false, message: "Failed to create category." },
      { status: 500 },
    );
  }
}
