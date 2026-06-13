import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return Response.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Look up the user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return Response.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Verify the password against the stored hash
    const isMatch = await bcrypt.compare(String(password), user.password);
    if (!isMatch) {
      return Response.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Block accounts that are not active
    if (user.status !== "active") {
      return Response.json(
        { success: false, message: `Your account is ${user.status}. Please contact support.` },
        { status: 403 }
      );
    }

    // Issue a JWT for the authenticated user
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not set.");
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Never return the password hash to the client
    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      photo: user.photo,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };

    return Response.json(
      { success: true, message: "Logged in successfully.", token, user: safeUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
