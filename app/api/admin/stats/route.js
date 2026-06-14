import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";
import Course from "@/models/courseModel";
import Blog from "@/models/blogModel";
import Category from "@/models/categoryModel";
import { requireRole } from "@/lib/auth";

// Effective amount a course actually charges, honouring its price tier.
function effectivePrice(c) {
  if (c.priceTier === "free") return 0;
  if (c.priceTier === "discounted" && c.discountPrice) return c.discountPrice;
  return c.price || 0;
}

function byNewest(a, b) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

// GET /api/admin/stats — one-shot platform overview for the admin dashboard.
export async function GET(request) {
  try {
    const auth = await requireRole(request, ["admin", "superadmin"]);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    await dbConnect();

    const [users, courses, blogs, categoriesCount] = await Promise.all([
      User.find({}).select("name email role status photo createdAt").lean(),
      Course.find({})
        .select("title status priceTier price discountPrice studentsEnrolled inWishlistOf category thumbnail createdAt")
        .lean(),
      Blog.find({}).select("title status views category createdAt author").populate("author", "name").lean(),
      Category.countDocuments({}),
    ]);

    /* ---- Headline totals ---- */
    const studentCount = users.filter((u) => u.role === "user").length;
    const teacherCount = users.filter((u) => u.role === "teacher").length;
    const adminCount = users.filter((u) => ["admin", "superadmin"].includes(u.role)).length;
    const activeUsers = users.filter((u) => u.status === "active").length;

    const publishedCourses = courses.filter((c) => c.status === "published").length;
    const publishedBlogs = blogs.filter((b) => b.status === "published").length;

    const enrollments = courses.reduce((s, c) => s + (c.studentsEnrolled?.length || 0), 0);
    const wishlists = courses.reduce((s, c) => s + (c.inWishlistOf?.length || 0), 0);
    const revenue = courses.reduce(
      (s, c) => s + effectivePrice(c) * (c.studentsEnrolled?.length || 0),
      0,
    );
    const blogViews = blogs.reduce((s, b) => s + (b.views || 0), 0);

    const totals = {
      users: users.length,
      students: studentCount,
      teachers: teacherCount,
      admins: adminCount,
      activeUsers,
      courses: courses.length,
      publishedCourses,
      blogs: blogs.length,
      publishedBlogs,
      categories: categoriesCount,
      enrollments,
      wishlists,
      revenue,
      blogViews,
    };

    /* ---- Distributions (shaped for Recharts: {name, value}) ---- */
    const usersByRole = [
      { name: "Students", value: studentCount },
      { name: "Teachers", value: teacherCount },
      { name: "Admins", value: adminCount },
    ].filter((d) => d.value > 0);

    const countByStatus = (items) =>
      ["published", "draft", "archived"].map((status) => ({
        name: status[0].toUpperCase() + status.slice(1),
        value: items.filter((i) => i.status === status).length,
      }));

    const coursesByStatus = countByStatus(courses);
    const blogsByStatus = countByStatus(blogs);

    /* ---- 6-month growth time series ---- */
    const now = new Date();
    const buckets = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleString("en-US", { month: "short" }),
        users: 0,
        courses: 0,
        blogs: 0,
      });
    }
    const bucketOf = (date) => {
      const d = new Date(date);
      return buckets.find((b) => b.key === `${d.getFullYear()}-${d.getMonth()}`);
    };
    for (const u of users) bucketOf(u.createdAt) && (bucketOf(u.createdAt).users += 1);
    for (const c of courses) bucketOf(c.createdAt) && (bucketOf(c.createdAt).courses += 1);
    for (const b of blogs) bucketOf(b.createdAt) && (bucketOf(b.createdAt).blogs += 1);
    const growth = buckets.map(({ label, users, courses, blogs }) => ({ label, users, courses, blogs }));

    /* ---- Top courses by enrollment ---- */
    const topCourses = [...courses]
      .map((c) => ({
        id: String(c._id),
        title: c.title,
        students: c.studentsEnrolled?.length || 0,
        revenue: effectivePrice(c) * (c.studentsEnrolled?.length || 0),
      }))
      .sort((a, b) => b.students - a.students)
      .slice(0, 5);

    /* ---- Courses per category ---- */
    const catMap = {};
    for (const c of courses) {
      const key = c.category || "Uncategorised";
      catMap[key] = (catMap[key] || 0) + 1;
    }
    const coursesByCategory = Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    /* ---- Recent activity ---- */
    const recentUsers = [...users]
      .sort(byNewest)
      .slice(0, 5)
      .map((u) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        role: u.role,
        photo: u.photo,
        createdAt: u.createdAt,
      }));

    const recentCourses = [...courses]
      .sort(byNewest)
      .slice(0, 5)
      .map((c) => ({
        id: String(c._id),
        title: c.title,
        status: c.status,
        category: c.category,
        thumbnail: c.thumbnail,
        students: c.studentsEnrolled?.length || 0,
        createdAt: c.createdAt,
      }));

    const recentBlogs = [...blogs]
      .sort(byNewest)
      .slice(0, 5)
      .map((b) => ({
        id: String(b._id),
        title: b.title,
        status: b.status,
        views: b.views || 0,
        author: b.author?.name || "—",
        createdAt: b.createdAt,
      }));

    return Response.json(
      {
        success: true,
        stats: {
          totals,
          usersByRole,
          coursesByStatus,
          blogsByStatus,
          growth,
          topCourses,
          coursesByCategory,
          recentUsers,
          recentCourses,
          recentBlogs,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin stats error:", error);
    return Response.json({ success: false, message: "Failed to load dashboard stats." }, { status: 500 });
  }
}
