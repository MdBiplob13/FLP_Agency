import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/notificationModel";
import { getAuthUser } from "@/lib/auth";

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// PATCH /api/notifications/[id] — mark a single notification read (or unread via
// { read: false }). A user may only touch their own notifications.
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return Response.json({ success: false, message: "Invalid notification id." }, { status: 400 });
    }

    const auth = await getAuthUser(request);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const body = await request.json().catch(() => ({}));
    const read = body.read !== false; // default true

    await dbConnect();
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: auth.user._id },
      { $set: { read } },
      { new: true }
    );
    if (!notification) {
      return Response.json({ success: false, message: "Notification not found." }, { status: 404 });
    }

    return Response.json({ success: true, notification }, { status: 200 });
  } catch (error) {
    console.error("Notification PATCH error:", error);
    return Response.json({ success: false, message: "Failed to update notification." }, { status: 500 });
  }
}

// DELETE /api/notifications/[id] — remove one of the current user's notifications.
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return Response.json({ success: false, message: "Invalid notification id." }, { status: 400 });
    }

    const auth = await getAuthUser(request);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    await dbConnect();
    const deleted = await Notification.findOneAndDelete({
      _id: id,
      recipient: auth.user._id,
    });
    if (!deleted) {
      return Response.json({ success: false, message: "Notification not found." }, { status: 404 });
    }

    return Response.json({ success: true, message: "Notification removed." }, { status: 200 });
  } catch (error) {
    console.error("Notification DELETE error:", error);
    return Response.json({ success: false, message: "Failed to remove notification." }, { status: 500 });
  }
}
