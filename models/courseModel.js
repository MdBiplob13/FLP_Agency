import mongoose from "mongoose";

// A single lesson inside a curriculum section
const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    videoUrl: { type: String, default: "" },
    duration: { type: Number, default: 0 }, // in minutes
    isPreview: { type: Boolean, default: false },
  },
  { _id: true }
);

// A curriculum section groups related lessons (e.g. "Module 1")
const sectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    lessons: { type: [lessonSchema], default: [] },
  },
  { _id: true }
);

// A scheduled class session. Calendar-based: the admin picks an exact date +
// time for each class, so `startDate` carries both. `_id` is enabled so an
// individual session can be edited or removed via the schedule API.
const scheduleSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" }, // optional, e.g. "Live Q&A"
    startDate: { type: Date, required: true }, // class date + time
  },
  { _id: true }
);

// An announcement an admin sends to everyone enrolled in the course. Stored on
// the course so it doubles as a per-course announcement history; sending one
// also fans out an in-app notification to each enrolled student.
const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, default: "", trim: true },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    recipientCount: { type: Number, default: 0 }, // students notified at send time
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// The batch currently open for / running this course
const batchSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true }, // e.g. "Batch 7"
    startDate: { type: Date },
    endDate: { type: Date },
    seatCapacity: { type: Number, default: 0 },
    enrolledCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming",
    },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000,
  },
  priceTier: {
    type: String,
    enum: ["free", "paid", "discounted"],
    default: "paid",
  },
  // Actual amounts backing the price tier
  price: {
    type: Number,
    default: 0,
    min: 0,
  },
  discountPrice: {
    type: Number,
    default: 0,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  level: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner",
  },
  language: {
    type: String,
    default: "Bangla",
    trim: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  thumbnail: {
    type: String,
    default: "",
  },
  // Relations — a course can have many teachers / students / wishlisters
  teachers: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: [],
  },
  studentsEnrolled: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: [],
  },
  inWishlistOf: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: [],
  },
  curriculum: {
    type: [sectionSchema],
    default: [],
  },
  schedule: {
    type: [scheduleSchema],
    default: [],
  },
  announcements: {
    type: [announcementSchema],
    default: [],
  },
  currentBatch: {
    type: batchSchema,
    default: null,
  },
  // Enrollment window + class start. These drive the public countdowns:
  //   now < enrollStartDate  → "Enrollment starts in …" (enrolling not yet open)
  //   enrollStart…enrollEnd  → "Enrollment closes in …" (enrolling open)
  //   enrollEnd…courseStart  → "Course starts in …" (enrolling closed)
  //   now >= courseStartDate → course running, no countdown
  // All null by default so courses without dates behave as always (open).
  enrollStartDate: {
    type: Date,
    default: null,
  },
  enrollEndDate: {
    type: Date,
    default: null,
  },
  courseStartDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
  },
  // Marketing flags managed by admins from the dashboard.
  // "Bestseller" shows a badge; "featured" pins the course to the homepage.
  isBestseller: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  // When true the course is withheld from the public catalogue even though it
  // may be "published". Enrolled students and managers keep full access; it only
  // disappears from the public /courses listing. A bestseller or homepage
  // (featured) course can never be hidden — the two states are mutually
  // exclusive and that invariant is enforced in the course API routes.
  isHidden: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hard cap on how many courses can be pinned to the homepage at once.
export const MAX_FEATURED_COURSES = 3;

// Keep updatedAt current on every save.
// Mongoose 9 dropped the `next` callback from pre hooks — use a sync/async
// function with no args instead of calling next().
courseSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

// Reuse the compiled model across hot reloads to avoid OverwriteModelError
export default mongoose.models.Course || mongoose.model("Course", courseSchema);
