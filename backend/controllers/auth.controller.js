import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { sendOTPEmail, generateOTP } from "../services/email.service.js";

export const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    // Create default settings
    await prisma.userSettings.create({
      data: {
        userId: user.id,
      },
    });

    // Create default categories
    const defaultCategories = [
      { name: "Food & Dining", icon: "🍔", color: "#ef4444" },
      { name: "Transportation", icon: "🚗", color: "#3b82f6" },
      { name: "Shopping", icon: "🛍️", color: "#8b5cf6" },
      { name: "Bills & Utilities", icon: "💡", color: "#f59e0b" },
      { name: "Entertainment", icon: "🎬", color: "#ec4899" },
      { name: "Healthcare", icon: "🏥", color: "#10b981" },
      { name: "Education", icon: "📚", color: "#6366f1" },
      { name: "Other", icon: "📦", color: "#6b7280" },
    ];

    await prisma.category.createMany({
      data: defaultCategories.map((cat) => ({
        ...cat,
        isDefault: true,
        userId: null,
      })),
    });

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request Password Reset
 *
 * Flow:
 * 1. User submits email
 * 2. Generate 6-digit OTP
 * 3. Save OTP to database (expires in 10 minutes)
 * 4. Invalidate any existing unused OTPs for this user
 * 5. Send OTP via email (non-blocking)
 * 6. Return success (don't reveal if user exists)
 */
export const requestPasswordReset = async (req, res) => {
  console.log("📧 Password reset request received");
  console.log("   Email:", req.body?.email);

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    console.log("📧 Processing password reset for:", email);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always return success - don't reveal if user exists (security best practice)
    if (!user) {
      console.log("ℹ️  User not found, returning success anyway");
      return res.status(200).json({
        message:
          "If an account exists with this email, a reset code has been sent.",
      });
    }

    console.log("✅ User found:", user.id);

    // Generate OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log("🔐 Generated OTP code");

    // Invalidate any existing unused OTPs for this user (security: prevent multiple valid OTPs)
    await prisma.oTPCode.updateMany({
      where: {
        userId: user.id,
        type: "password_reset",
        used: false,
      },
      data: {
        used: true, // Mark as used so only the new OTP is valid
      },
    });

    // Save new OTP to database
    await prisma.oTPCode.create({
      data: {
        userId: user.id,
        code,
        type: "password_reset",
        expiresAt,
      },
    });

    console.log("💾 OTP saved to database successfully");
    console.log("🔑 OTP Code:", code); // Always log for debugging

    // Send email in background - completely non-blocking
    console.log("📧 Attempting to send OTP email to:", user.email);
    sendOTPEmail(user.email, code, "password_reset")
      .then((result) => {
        console.log("📧 Email sending promise resolved:", result);
      })
      .catch((error) => {
        console.error("❌ Email sending promise rejected:", error.message);
        console.error("   Error stack:", error.stack);
        // Already handled in email service, but log here too for visibility
      });

    // Return success immediately - don't wait for email
    console.log("✅ Password reset request completed successfully");
    return res.status(200).json({
      message:
        "If an account exists with this email, a reset code has been sent.",
    });
  } catch (error) {
    console.error("❌ Password reset error:", error.message);
    console.error("   Error code:", error.code);
    console.error("   Stack:", error.stack);

    // Send error response directly - don't use next()
    return res.status(500).json({
      message: "An error occurred. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Verify OTP Code
 *
 * Flow:
 * 1. User submits email + 6-digit OTP code
 * 2. Find user by email
 * 3. Find valid, unused, non-expired OTP
 * 4. Mark OTP as used
 * 5. Generate JWT reset token (expires in 15 minutes)
 * 6. Return reset token to frontend
 */
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    console.log("🔍 Verifying OTP for:", email);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find valid OTP
    const otpRecord = await prisma.oTPCode.findFirst({
      where: {
        userId: user.id,
        code: code.trim(),
        type: "password_reset",
        used: false,
        expiresAt: {
          gt: new Date(), // Not expired
        },
      },
      orderBy: {
        createdAt: "desc", // Get the most recent OTP
      },
    });

    if (!otpRecord) {
      console.log("❌ Invalid or expired OTP");
      return res.status(400).json({
        message: "Invalid or expired code. Please request a new code.",
      });
    }

    // Mark OTP as used (prevent reuse)
    await prisma.oTPCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    console.log("✅ OTP verified successfully");

    // Generate temporary reset token (JWT)
    const resetToken = jwt.sign(
      { userId: user.id, type: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // Short expiration for security
    );

    res.json({
      message: "Code verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error("❌ OTP verification error:", error.message);
    next(error);
  }
};

/**
 * Reset Password
 *
 * Flow:
 * 1. User submits resetToken (JWT) + newPassword
 * 2. Verify JWT token (check expiration and type)
 * 3. Hash new password
 * 4. Update user password in database
 * 5. Optionally: Invalidate all user sessions (logout everywhere)
 * 6. Return success
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        message: "Reset token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    console.log("🔐 Processing password reset");

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      if (decoded.type !== "password_reset") {
        return res.status(400).json({ message: "Invalid token type" });
      }
    } catch (error) {
      console.log("❌ Invalid or expired reset token");
      return res.status(400).json({
        message: "Invalid or expired reset token. Please request a new code.",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    });

    console.log("✅ Password reset successfully for user:", decoded.userId);

    // Clean up any remaining unused OTPs for this user
    await prisma.oTPCode.updateMany({
      where: {
        userId: decoded.userId,
        type: "password_reset",
        used: false,
      },
      data: {
        used: true,
      },
    });

    res.json({
      message:
        "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("❌ Password reset error:", error.message);
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
};
