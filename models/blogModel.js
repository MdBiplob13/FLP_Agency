import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 200,
  },
  // Short summary shown on cards and previews. Auto-derived from the content
  // when left blank (see the pre-save hook).
  excerpt: {
    type: String,
    trim: true,
    maxlength: 400,
    default: "",
  },
  // The full post body. Rendered with preserved line breaks on the detail page.
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 20,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  coverImage: {
    type: String,
    default: "",
  },
  // The admin who authored the post.
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
  },
  // Pins the post to the top of the public blog page. Only ONE post is featured
  // at a time — the POST/PATCH handlers clear the flag on every other post.
  isFeatured: {
    type: Boolean,
    default: false,
  },
  // Read counter, bumped on each public detail view.
  views: {
    type: Number,
    default: 0,
  },
  // Estimated reading time in minutes, recomputed from the content on save.
  readTime: {
    type: Number,
    default: 1,
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

// Keep updatedAt current, backfill the excerpt, and recompute read time.
// Mongoose 9 dropped the `next` callback from pre hooks — use a sync/async
// function with no args instead of calling next().
blogSchema.pre("save", function () {
  this.updatedAt = Date.now();

  if (this.content) {
    // ~200 words per minute is the usual reading-speed estimate.
    const words = this.content.trim().split(/\s+/).filter(Boolean).length;
    this.readTime = Math.max(1, Math.round(words / 200));

    // Derive an excerpt from the body when the author didn't supply one.
    if (!this.excerpt || !this.excerpt.trim()) {
      this.excerpt = this.content.trim().slice(0, 200);
    }
  }
});

// Reuse the compiled model across hot reloads to avoid OverwriteModelError
export default mongoose.models.Blog || mongoose.model("Blog", blogSchema);
