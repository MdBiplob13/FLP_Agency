import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/categoryModel";
import Course from "@/models/courseModel";
import { requireRole } from "@/lib/auth";

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// PATCH /api/categories/[id] — rename / edit a category (admins only)
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return Response.json({ success: false, message: "Invalid category id." }, { status: 400 });
    }

    const auth = await requireRole(request, ["admin", "superadmin"]);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    await dbConnect();
    const category = await Category.findById(id);
    if (!category) {
      return Response.json({ success: false, message: "Category not found." }, { status: 404 });
    }

    const body = await request.json();
    const oldName = category.name;

    if ("name" in body) {
      const newName = (body.name || "").trim();
      if (!newName) {
        return Response.json({ success: false, message: "Category name cannot be empty." }, { status: 400 });
      }

      // Block a rename that collides with a different existing category
      const slug = newName.toLowerCase();
      const clash = await Category.findOne({ slug, _id: { $ne: category._id } });
      if (clash) {
        return Response.json(
          { success: false, message: "Another category with this name already exists." },
          { status: 409 }
        );
      }
      category.name = newName;
    }

    if ("description" in body) {
      category.description = (body.description || "").trim();
    }

    await category.save();

    // If the name changed, cascade it to every course using the old name so
    // the string stored on courses stays consistent.
    let updatedCourses = 0;
    if (category.name !== oldName) {
      const result = await Course.updateMany(
        { category: oldName },
        { $set: { category: category.name } }
      );
      updatedCourses = result.modifiedCount || 0;
    }

    return Response.json(
      { success: true, message: "Category updated.", category, updatedCourses },
      { status: 200 }
    );
  } catch (error) {
    if (error?.name === "ValidationError") {
      return Response.json({ success: false, message: error.message }, { status: 400 });
    }
    console.error("Category PATCH error:", error);
    return Response.json({ success: false, message: "Failed to update category." }, { status: 500 });
  }
}

// DELETE /api/categories/[id] — remove a category (admins only)
// Blocked when a PUBLISHED course still uses it.
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return Response.json({ success: false, message: "Invalid category id." }, { status: 400 });
    }

    const auth = await requireRole(request, ["admin", "superadmin"]);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    await dbConnect();
    const category = await Category.findById(id);
    if (!category) {
      return Response.json({ success: false, message: "Category not found." }, { status: 404 });
    }

    // Guard: a category with any published course cannot be deleted
    const publishedCount = await Course.countDocuments({
      category: category.name,
      status: "published",
    });
    if (publishedCount > 0) {
      return Response.json(
        {
          success: false,
          message: `Cannot delete: ${publishedCount} published course${
            publishedCount > 1 ? "s" : ""
          } still use this category.`,
        },
        { status: 409 }
      );
    }

    await category.deleteOne();
    return Response.json({ success: true, message: "Category deleted." }, { status: 200 });
  } catch (error) {
    console.error("Category DELETE error:", error);
    return Response.json({ success: false, message: "Failed to delete category." }, { status: 500 });
  }
}
