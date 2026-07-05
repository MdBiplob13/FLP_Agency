import dbConnect from "@/lib/dbConnect";
import Course, { MAX_FEATURED_COURSES } from "@/models/courseModel";
import { requireRole, getAuthUser } from "@/lib/auth";
import { ensureCategory } from "@/lib/categories";

// GET /api/courses — public catalogue with filtering, search & pagination
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const level = searchParams.get("level");
    const priceTier = searchParams.get("priceTier");
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");
    const bestseller = searchParams.get("bestseller");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));

    const query = {};

    // Admins managing the dashboard may request drafts/all statuses; the public
    // listing is always restricted to published courses.
    let isManager = false;
    if (status) {
      const auth = await getAuthUser(request);
      isManager = !auth.error && ["admin", "superadmin", "teacher"].includes(auth.user.role);
    }
    if (isManager) {
      if (status && status !== "all") query.status = status;
    } else {
      // Public catalogue: only published courses, and never hidden ones.
      query.status = "published";
      query.isHidden = { $ne: true };
    }

    if (category && category !== "All") query.category = category;
    if (level && level !== "All") query.level = level.toLowerCase();
    if (priceTier && priceTier !== "All") query.priceTier = priceTier;
    // Marketing flag filters (e.g. homepage fetches ?featured=true)
    if (featured === "true") query.isFeatured = true;
    if (bestseller === "true") query.isBestseller = true;
    if (search) {
      const rx = new RegExp(search.trim(), "i");
      query.$or = [{ title: rx }, { description: rx }, { category: rx }, { tags: rx }];
    }

    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      Course.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("teachers", "name photo role")
        .lean(),
      Course.countDocuments(query),
    ]);

    return Response.json(
      {
        success: true,
        courses,
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
    console.error("Courses GET error:", error);
    return Response.json(
      { success: false, message: "Failed to load courses." },
      { status: 500 }
    );
  }
}

// POST /api/courses — create a course (teachers & admins only)
export async function POST(request) {
  try {
    const auth = await requireRole(request, ["teacher", "admin", "superadmin"]);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { title, description, category } = body;

    if (!title || !description || !category) {
      return Response.json(
        { success: false, message: "Title, description and category are required." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Auto-register the category if it doesn't exist yet, and normalize the
    // course's category string to the canonical stored name.

    
    const categoryDoc = await ensureCategory(category);
    const categoryName = categoryDoc ? categoryDoc.name : category.trim();

    // The creator is attached as a teacher by default
    const teachers = Array.isArray(body.teachers) && body.teachers.length
      ? body.teachers
      : [auth.user._id];

    // Refuse to feature a new course if the homepage is already full
    const wantFeatured = body.isFeatured === true;
    if (wantFeatured) {
      const featuredCount = await Course.countDocuments({ isFeatured: true });
      if (featuredCount >= MAX_FEATURED_COURSES) {
        return Response.json(
          {
            success: false,
            message: `Only ${MAX_FEATURED_COURSES} courses can be featured on the homepage. Unfeature one first.`,
          },
          { status: 409 }
        );
      }
    }

    // A hidden course can't also be a bestseller or pinned to the homepage.
    const wantHidden = body.isHidden === true;
    if (wantHidden && (body.isBestseller === true || wantFeatured)) {
      return Response.json(
        {
          success: false,
          message: "A bestseller or homepage course can't be hidden. Remove those flags first.",
        },
        { status: 409 }
      );
    }

    const course = await Course.create({
      title,
      slug: body.slug || undefined,
      description,
      category: categoryName,
      priceTier: body.priceTier,
      price: body.price,
      discountPrice: body.discountPrice,
      level: body.level,
      language: body.language,
      tags: body.tags,
      thumbnail: body.thumbnail,
      curriculum: body.curriculum,
      schedule: body.schedule,
      currentBatch: body.currentBatch,
      enrollStartDate: body.enrollStartDate,
      enrollEndDate: body.enrollEndDate,
      courseStartDate: body.courseStartDate,
      status: body.status,
      isBestseller: body.isBestseller === true,
      isFeatured: wantFeatured,
      isHidden: wantHidden,
      teachers,
    });

    return Response.json(
      { success: true, message: "Course created successfully.", course },
      { status: 201 }
    );
  } catch (error) {
    if (error?.name === "ValidationError") {
      return Response.json({ success: false, message: error.message }, { status: 400 });
    }
    console.error("Courses POST error:", error);
    return Response.json(
      { success: false, message: "Failed to create course." },
      { status: 500 }
    );
  }
}
