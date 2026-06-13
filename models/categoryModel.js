import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 60,
    unique: true,
  },
  // Lowercased name used for case-insensitive uniqueness & lookups
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 300,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


// Reuse the compiled model across hot reloads to avoid OverwriteModelError
export default mongoose.models.Category || mongoose.model("Category", categorySchema);
