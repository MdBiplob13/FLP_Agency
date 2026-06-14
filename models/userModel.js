import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    default:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
  },
  status: {
    type: String,
    enum: ["active", "inactive", "blocked"],
    default: "active",
  },
  address: {
    type: String,
    default: "No address provided",
  },
  role: {
    type: String,
    enum: ["user", "teacher", "admin", "superadmin"],
    default: "user",
  },
  courses: {
    type: Array,
    default: [],
  },
  wishlist: {
    type: Array,
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  socialLinks: {
    type: Object,
    default: {
      facebook: "",
      instagram: "",
      linkedin: "",
    },
  },
  // Marketing flag for teachers. At most ONE teacher is featured at a time —
  // the /api/teachers/[id] PATCH clears the flag on everyone else when set.
  isFeatured: {
    type: Boolean,
    default: false,
  },
});

// Reuse the compiled model across hot reloads to avoid OverwriteModelError
export default mongoose.models.User || mongoose.model("User", userSchema);
