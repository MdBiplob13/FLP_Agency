import mongoose from "mongoose";

// A single in-app notification addressed to ONE recipient. Broadcasts (e.g. an
// announcement to every student in a course, or an event sent to all admins) are
// stored as one document per recipient so read/unread state is per-user.
const notificationSchema = new mongoose.Schema({
  // Who sees this notification.
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  // Coarse grouping that also drives the icon/colour the UI picks.
  //   enrollment | signup | wishlist  → admin-facing events
  //   announcement | schedule | welcome → student-facing events
  type: {
    type: String,
    enum: [
      "enrollment",
      "signup",
      "wishlist",
      "announcement",
      "schedule",
      "welcome",
    ],
    required: true,
  },
  title: { type: String, required: true, trim: true },
  body: { type: String, default: "", trim: true },
  // Optional deep-link the UI navigates to when the row is clicked.
  link: { type: String, default: "" },
  // Optional course this notification relates to (announcements, schedule, …).
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    default: null,
  },
  // Optional actor who triggered the event (the enrolling student, etc.).
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  read: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now },
});

// Common access pattern: newest notifications for one recipient.
notificationSchema.index({ recipient: 1, createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
