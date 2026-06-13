import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  subject: {
    type: String,
    trim: true,
    maxlength: 200,
    default: "",
  },
  message: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 2000,
  },
  status: {
    type: String,
    enum: ["new", "read", "responded", "archived"],
    default: "new",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Reuse the compiled model across hot reloads to avoid OverwriteModelError
export default mongoose.models.Contact || mongoose.model("Contact", contactSchema);
