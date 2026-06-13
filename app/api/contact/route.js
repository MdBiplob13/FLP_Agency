import dbConnect from "@/lib/dbConnect";
import Contact from "@/models/contactModel";
import { requireRole } from "@/lib/auth";

// POST /api/contact — public contact form submission
export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return Response.json(
        { success: false, message: "Name, email and message are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { success: false, message: "Please enter a valid email." },
        { status: 400 }
      );
    }

    await dbConnect();
    await Contact.create({ name, email, subject, message });

    return Response.json(
      { success: true, message: "Message sent! We'll get back to you within 24 hours." },
      { status: 201 }
    );
  } catch (error) {
    if (error?.name === "ValidationError") {
      return Response.json({ success: false, message: error.message }, { status: 400 });
    }
    console.error("Contact POST error:", error);
    return Response.json({ success: false, message: "Failed to send message." }, { status: 500 });
  }
}

// GET /api/contact — list submissions (admins only)
export async function GET(request) {
  try {
    const auth = await requireRole(request, ["admin", "superadmin"]);
    if (auth.error) {
      return Response.json({ success: false, message: auth.error }, { status: auth.status });
    }

    await dbConnect();
    const messages = await Contact.find().sort({ createdAt: -1 }).lean();

    return Response.json(
      { success: true, messages, count: messages.length },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact GET error:", error);
    return Response.json({ success: false, message: "Failed to load messages." }, { status: 500 });
  }
}
