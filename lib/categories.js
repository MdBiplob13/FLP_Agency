import Category from "@/models/categoryModel";

/**
 * Ensure a category exists for the given name. Case-insensitive: returns the
 * existing category if one matches the slug, otherwise creates it.
 * Assumes dbConnect() has already been called by the caller.
 * Returns the Category document, or null for an empty name.
 */
export async function ensureCategory(name) {
  if (!name) return null;
  const slug = name.toLowerCase();

  const existing = await Category.findOne({ slug });
  if (existing) return existing;

  try {
    return await Category.create({ name: name, slug: slug });
  } catch (err) {
    // Handle the race where a concurrent request created the same slug
    if (err?.code === 11000) {
      return Category.findOne({ slug });
    }
    throw err;
  }
}
