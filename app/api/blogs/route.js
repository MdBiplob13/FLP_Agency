import dbConnect from "@/lib/dbConnect";
import Blog from "@/models/blogModel";
import { requireRole, getAuthUser } from "@/lib/auth";
import { ensureCategory } from "@/lib/categories";

// GET /api/blogs — public blog listing with filtering, search & pagination.
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const featured = searchParams.get("featured");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));

    const query = {};

    // Admins managing the dashboard may request drafts/all statuses; the public
    // listing is always restricted to published posts.
    let isManager = false;
    if (status) {
      const auth = await getAuthUser(request);
      isManager = !auth.error && ["admin", "superadmin"].includes(auth.user.role);
    }
    if (isManager) {
      if (status && status !== "all") query.status = status;
    } else {
      query.status = "published";
    }

    if (category && category !== "All") query.category = category;
    if (tag) query.tags = tag;
    if (featured === "true") query.isFeatured = true;
    if (search) {
      const rx = new RegExp(search.trim(), "i");
      query.$or = [{ title: rx }, { excerpt: rx }, { category: rx }, { tags: rx }];
    }

    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        // Featured posts surface first, then newest.
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "name photo role")
        .select("-content") // list view never needs the full body
        .lean(),
      Blog.countDocuments(query),
    ]);

    return Response.json(
      {
        success: true,
        blogs,
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
    console.error("Blogs GET error:", error);
    return Response.json({ success: false, message: "Failed to load blogs." }, { status: 500 });
  }
}

// POST /api/blogs — create a post (admins only).
export async function POST(request) {
  try {
    const auth = await requireRole(request, ["admin", "superadmin"]);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { title, content, category } = body;

    if (!title || !content || !category) {
      return Response.json(
        { success: false, message: "Title, content and category are required." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Auto-register the category if it's new, and store its canonical name.
    const categoryDoc = await ensureCategory(category);
    const categoryName = categoryDoc ? categoryDoc.name : category.trim();

    const wantFeatured = body.isFeatured === true;
    // Only ONE featured post at a time — clear the flag on everyone else first.
    if (wantFeatured) {
      await Blog.updateMany({ isFeatured: true }, { $set: { isFeatured: false } });
    }

    const blog = await Blog.create({
      title,
      excerpt: body.excerpt,
      content,
      category: categoryName,
      tags: Array.isArray(body.tags) ? body.tags : [],
      coverImage: body.coverImage,
      status: body.status,
      isFeatured: wantFeatured,
      author: auth.user._id,
    });

    return Response.json(
      { success: true, message: "Blog created successfully.", blog },
      { status: 201 }
    );
  } catch (error) {
    if (error?.name === "ValidationError") {
      return Response.json({ success: false, message: error.message }, { status: 400 });
    }
    console.error("Blogs POST error:", error);
    return Response.json({ success: false, message: "Failed to create blog." }, { status: 500 });
  }
}
