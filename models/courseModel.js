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

// A recurring class slot for a batch
const scheduleSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
      required: true,
    },
    startTime: { type: String, required: true }, // "18:00"
    endTime: { type: String, required: true }, // "20:00"
  },
  { _id: false }
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
  currentBatch: {
    type: batchSchema,
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
