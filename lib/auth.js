import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";

/**
 * Extract the bearer token from an incoming request.
 * Accepts either "Authorization: Bearer <token>" or the raw header value.
 */
export function getTokenFromRequest(request) {
  const authHeader = request.headers.get("authorization") || "";
  return authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authHeader.trim();
}

/**
 * Verify the request's JWT and load the matching user.
 * Returns { user } on success, or { error, status } describing the failure.
 * Never throws for auth problems — callers branch on `error`.
 */
export async function getAuthUser(request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return { error: "Authentication required.", status: 401 };
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set.");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return { error: "Invalid or expired token.", status: 401 };
  }

  await dbConnect();
  const user = await User.findById(decoded.id).select("-password");
  if (!user) {
    return { error: "User no longer exists.", status: 401 };
  }
  if (user.status !== "active") {
    return { error: `Your account is ${user.status}.`, status: 403 };
  }

  return { user };
}

/**
 * Verify the request's JWT AND require one of the given roles.
 * Returns { user } or { error, status }.
 */
export async function requireRole(request, roles = []) {
  const result = await getAuthUser(request);
  if (result.error) return result;

  if (roles.length && !roles.includes(result.user.role)) {
    return { error: "You do not have permission to perform this action.", status: 403 };
  }
  return result;
}
