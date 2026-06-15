import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/notificationModel";
import { getAuthUser } from "@/lib/auth";

// GET /api/notifications — the current user's notifications (newest first) plus
// an unread count. Any logged-in account has its own feed.
//
// Query: ?limit=20  ?unread=true (only unread)
export async function GET(request) {
  try {
    const auth = await getAuthUser(request);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const unreadOnly = searchParams.get("unread") === "true";

    const query = { recipient: auth.user._id };
    if (unreadOnly) query.read = false;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("actor", "name photo")
        .populate("course", "title thumbnail")
        .lean(),
      Notification.countDocuments({ recipient: auth.user._id, read: false }),
    ]);

    return Response.json({ success: true, notifications, unreadCount }, { status: 200 });
  } catch (error) {
    console.error("Notifications GET error:", error);
    return Response.json(
      { success: false, message: "Failed to load notifications." },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications — mark ALL of the current user's notifications read.
export async function PATCH(request) {
  try {
    const auth = await getAuthUser(request);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    await dbConnect();
    await Notification.updateMany(
      { recipient: auth.user._id, read: false },
      { $set: { read: true } }
    );

    return Response.json({ success: true, message: "All notifications marked read." }, { status: 200 });
  } catch (error) {
    console.error("Notifications PATCH error:", error);
    return Response.json(
      { success: false, message: "Failed to update notifications." },
      { status: 500 }
    );
  }
}
