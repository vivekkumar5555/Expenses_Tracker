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

export const requestPasswordReset = async (req, res) => {
  console.log("📧 Password reset request received");
  console.log("   Email:", req.body?.email);

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    console.log("📧 Processing password reset for:", email);

    // Find user - simple query without timeout wrapper
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists - return success anyway
      console.log("ℹ️  User not found, returning success anyway");
      return res.status(200).json({
        message: "If email exists, reset code has been sent",
      });
    }

    console.log("✅ User found:", user.id);

    // Generate OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log("🔐 Generated OTP code");

    // Save OTP to database
    await prisma.oTPCode.create({
      data: {
        userId: user.id,
        code,
        type: "password_reset",
        expiresAt,
      },
    });

    console.log("💾 OTP saved to database successfully");
    console.log("🔑 OTP Code:", code); // Always log the code

    // Send email in background - completely non-blocking
    // Don't await - let it run in background
    sendOTPEmail(user.email, code, "password_reset").catch(() => {
      // Already handled in email service
    });

    // Return success immediately - don't wait for email
    console.log("✅ Password reset request completed successfully");
    return res.status(200).json({
      message: "If email exists, reset code has been sent",
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

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otpRecord = await prisma.oTPCode.findFirst({
      where: {
        userId: user.id,
        code,
        type: "password_reset",
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    // Mark as used
    await prisma.oTPCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Generate temporary token for password reset
    const resetToken = jwt.sign(
      { userId: user.id, type: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({
      message: "Code verified successfully",
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      if (decoded.type !== "password_reset") {
        return res.status(400).json({ message: "Invalid token type" });
      }
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
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
