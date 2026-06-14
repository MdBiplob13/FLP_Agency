import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Blog from "@/models/blogModel";
import { requireRole, getAuthUser } from "@/lib/auth";
import { ensureCategory } from "@/lib/categories";

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/blogs/[id] — public single post + a few related posts.
//
// Published posts are public; drafts/archived are only visible to admins via a
// valid token. Each public view of a published post bumps the read counter.
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return Response.json({ success: false, message: "Invalid blog id." }, { status: 400 });
    }

    await dbConnect();

    const blog = await Blog.findById(id).populate("author", "name photo role").lean();
    if (!blog) {
      return Response.json({ success: false, message: "Blog not found." }, { status: 404 });
    }

    // Hide unpublished posts from anyone who isn't an admin.
    if (blog.status !== "published") {
      const auth = await getAuthUser(request);
      const isManager = !auth.error && ["admin", "superadmin"].includes(auth.user.role);
      if (!isManager) {
        return Response.json({ success: false, message: "Blog not found." }, { status: 404 });
      }
    } else {
      // Fire-and-forget read counter; never block the response on it.
      Blog.updateOne({ _id: id }, { $inc: { views: 1 } }).catch(() => {});
    }

    // Related published posts — same category first, newest, excluding this one.
    const related = await Blog.find({
      _id: { $ne: blog._id },
      status: "published",
      category: blog.category,
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("author", "name photo role")
      .select("-content")
      .lean();

    return Response.json({ success: true, blog, related }, { status: 200 });
  } catch (error) {
    console.error("Blog GET error:", error);
    return Response.json({ success: false, message: "Failed to load blog." }, { status: 500 });
  }
}

// PATCH /api/blogs/[id] — update a post (admins only).
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return Response.json({ success: false, message: "Invalid blog id." }, { status: 400 });
    }

    const auth = await requireRole(request, ["admin", "superadmin"]);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    await dbConnect();
    const blog = await Blog.findById(id);
    if (!blog) {
      return Response.json({ success: false, message: "Blog not found." }, { status: 404 });
    }

    const body = await request.json();

    // Turning on "featured" demotes whichever post currently holds the slot.
    if (body.isFeatured === true && !blog.isFeatured) {
      await Blog.updateMany(
        { _id: { $ne: blog._id }, isFeatured: true },
        { $set: { isFeatured: false } }
      );
    }

    // Whitelist updatable fields — never trust the client with author/views.
    const updatable = [
      "title", "excerpt", "content", "category", "tags",
      "coverImage", "status", "isFeatured",
    ];
    for (const key of updatable) {
      if (key in body) blog[key] = body[key];
    }

    // If the category changed to a new one, register it and use canonical name.
    if ("category" in body && body.category?.trim()) {
      const categoryDoc = await ensureCategory(body.category);
      blog.category = categoryDoc ? categoryDoc.name : body.category.trim();
    }

    await blog.save();
    return Response.json({ success: true, message: "Blog updated.", blog }, { status: 200 });
  } catch (error) {
    if (error?.name === "ValidationError") {
      return Response.json({ success: false, message: error.message }, { status: 400 });
    }
    console.error("Blog PATCH error:", error);
    return Response.json({ success: false, message: "Failed to update blog." }, { status: 500 });
  }
}

// DELETE /api/blogs/[id] — remove a post (admins only).
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return Response.json({ success: false, message: "Invalid blog id." }, { status: 400 });
    }

    const auth = await requireRole(request, ["admin", "superadmin"]);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    await dbConnect();
    const blog = await Blog.findById(id);
    if (!blog) {
      return Response.json({ success: false, message: "Blog not found." }, { status: 404 });
    }

    await blog.deleteOne();
    return Response.json({ success: true, message: "Blog deleted." }, { status: 200 });
  } catch (error) {
    console.error("Blog DELETE error:", error);
    return Response.json({ success: false, message: "Failed to delete blog." }, { status: 500 });
  }
}
