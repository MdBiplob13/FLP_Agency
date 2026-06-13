import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";

export async function POST(request) {
  try {
    const { name, email, phone, password } = await request.json();

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return Response.json(
        { success: false, message: "Name, email, phone and password are required." },
        { status: 400 }
      );
    }

    if (String(password).length < 8) {
      return Response.json(
        { success: false, message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Reject duplicate emails
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return Response.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(String(password), 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone,
      password: hashedPassword,
    });

    // Issue a JWT for the freshly created user
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
      { success: true, message: "Account created successfully.", token, user: safeUser },
      { status: 201 }
    );
  } catch (error) {
    // Mongoose validation errors -> 400
    if (error?.name === "ValidationError") {
      return Response.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    console.error("Signup error:", error);
    return Response.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
