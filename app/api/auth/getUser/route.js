import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";

export async function GET(request) {
  try {
    // Token may arrive as "Bearer <token>" in the Authorization header
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    if (!token) {
      return Response.json(
        { success: false, status: "fail", message: "No token provided." },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not set.");
    }

    // Verify the token signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return Response.json(
        { success: false, status: "fail", message: "Invalid or expired token." },
        { status: 401 }
      );
    }

    await dbConnect();

    // Never select the password hash
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return Response.json(
        { success: false, status: "fail", message: "User no longer exists." },
        { status: 404 }
      );
    }

    if (user.status !== "active") {
      return Response.json(
        { success: false, status: "fail", message: `Your account is ${user.status}.` },
        { status: 403 }
      );
    }

    return Response.json(
      { success: true, status: "success", user },
      { status: 200 }
    );
  } catch (error) {
    console.error("getUser error:", error);
    return Response.json(
      { success: false, status: "fail", message: "Something went wrong." },
      { status: 500 }
    );
  }
}
