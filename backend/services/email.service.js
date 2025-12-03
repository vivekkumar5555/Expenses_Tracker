import nodemailer from "nodemailer";

// Create transporter only if email credentials are configured
let transporter = null;

const createTransporter = () => {
  if (transporter) return transporter;

  // Check if email is configured
  let emailHost = process.env.EMAIL_HOST;
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailHost || !emailUser || !emailPass) {
    console.warn("⚠️  Email service not configured.");
    console.warn("   Missing:", {
      EMAIL_HOST: !emailHost ? "NOT SET" : "SET",
      EMAIL_USER: !emailUser ? "NOT SET" : "SET",
      EMAIL_PASS: !emailPass ? "NOT SET" : "SET",
    });
    console.warn("   Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env");
    return null;
  }

  // Clean and validate EMAIL_HOST
  emailHost = emailHost.trim();

  // Check for common EMAIL_HOST issues
  if (
    emailHost.includes("your_host") ||
    emailHost.includes("smtp.example.com")
  ) {
    console.warn("⚠️  Email service using placeholder EMAIL_HOST!");
    console.warn("   Current EMAIL_HOST:", emailHost);
    console.warn(
      "   Update EMAIL_HOST with real SMTP server (e.g., smtp.gmail.com)"
    );
    return null;
  }

  // Check for protocol prefix (shouldn't be there)
  if (emailHost.startsWith("http://") || emailHost.startsWith("https://")) {
    console.warn("⚠️  EMAIL_HOST should not include protocol!");
    console.warn("   Current EMAIL_HOST:", emailHost);
    console.warn("   Remove http:// or https:// prefix");
    console.warn("   Use: smtp.gmail.com (not https://smtp.gmail.com)");
    return null;
  }

  // Check for common typos in Gmail host
  const commonTypos = {
    "smtp.gmial.com": "smtp.gmail.com",
    "smtp.gmai.com": "smtp.gmail.com",
    "smtp.gmal.com": "smtp.gmail.com",
    "smtp.gmaiil.com": "smtp.gmail.com",
  };

  if (commonTypos[emailHost.toLowerCase()]) {
    console.warn("⚠️  EMAIL_HOST typo detected!");
    console.warn("   Current EMAIL_HOST:", emailHost);
    console.warn("   Did you mean:", commonTypos[emailHost.toLowerCase()]);
    console.warn("   Fix the typo in your .env file");
    return null;
  }

  // Validate hostname format (basic check)
  const hostnameRegex =
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!hostnameRegex.test(emailHost)) {
    console.warn("⚠️  Invalid EMAIL_HOST format!");
    console.warn("   Current EMAIL_HOST:", emailHost);
    console.warn(
      "   EMAIL_HOST should be a valid hostname (e.g., smtp.gmail.com)"
    );
    console.warn("   Check for typos, spaces, or invalid characters");
    return null;
  }

  // Check if using placeholder values for user/pass
  if (
    emailUser.includes("your_email") ||
    emailPass.includes("your_app_password")
  ) {
    console.warn("⚠️  Email service using placeholder values!");
    console.warn("   Update EMAIL_USER and EMAIL_PASS with real values");
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: emailHost,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      // Add connection timeout
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });

    console.log("✅ Email transporter created");
    console.log("   Host:", emailHost);
    console.log("   Port:", process.env.EMAIL_PORT || "587");
    console.log("   User:", emailUser);
    console.log(
      "   Secure:",
      process.env.EMAIL_PORT === "465" ? "Yes (SSL)" : "No (TLS)"
    );

    return transporter;
  } catch (error) {
    console.error("❌ Failed to create email transporter:", error.message);
    return null;
  }
};

// Test email connection
export const testEmailConnection = async () => {
  const transport = createTransporter();

  if (!transport) {
    return {
      success: false,
      message: "Email service not configured",
    };
  }

  try {
    await transport.verify();
    return {
      success: true,
      message: "Email connection verified successfully",
    };
  } catch (error) {
    console.error("❌ Email connection test failed:", error.message);
    return {
      success: false,
      message: `Email connection failed: ${error.message}`,
      error: error.message,
    };
  }
};

export const sendOTPEmail = async (email, code, type = "password_reset") => {
  // Always log the OTP code first - critical for debugging
  console.log("");
  console.log("═══════════════════════════════════════════════════════");
  console.log("📧 PASSWORD RESET OTP - sendOTPEmail() CALLED");
  console.log("═══════════════════════════════════════════════════════");
  console.log("   Email:", email);
  console.log("   OTP Code:", code);
  console.log("   Expires in: 10 minutes");
  console.log("   Type:", type);
  console.log("═══════════════════════════════════════════════════════");
  console.log("");

  console.log("🔍 Checking email configuration...");
  const transport = createTransporter();

  console.log("🔍 Transport result:", transport ? "CREATED" : "NULL");

  // If email is not configured, log the OTP and return immediately
  if (!transport) {
    console.log("");
    console.log("⚠️  [EMAIL NOT CONFIGURED - OTP CODE BELOW]");
    console.log("═══════════════════════════════════════════════════════");
    console.log("   OTP Code:", code);
    console.log("   Email:", email);
    console.log("   Use this code to reset password (expires in 10 minutes)");
    console.log("═══════════════════════════════════════════════════════");
    console.log("   Configure EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env");
    console.log("   Or check Render Dashboard → Environment variables");
    console.log("");
    return true;
  }

  console.log("✅ Email transporter available, proceeding to send email...");

  // Send email - use async/await properly
  try {
    const subject =
      type === "password_reset"
        ? "SmartSpend+ - Password Reset Code"
        : "SmartSpend+ - Email Verification Code";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">SmartSpend+</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #4b5563;">You requested to reset your password. Use the code below to verify your identity:</p>
            <div style="background: white; border: 2px dashed #6366f1; padding: 25px; text-align: center; margin: 25px 0; border-radius: 8px;">
              <div style="font-size: 36px; font-weight: bold; color: #6366f1; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${code}
              </div>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
              ⏰ This code will expire in <strong>10 minutes</strong>.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              If you didn't request this password reset, please ignore this email. Your account remains secure.
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
SmartSpend+ - Password Reset Code

Your password reset code is: ${code}

This code will expire in 10 minutes.

If you didn't request this password reset, please ignore this email.
    `;

    // Send email with proper error handling
    const info = await transport.sendMail({
      from: `"SmartSpend+" <${
        process.env.EMAIL_FROM || process.env.EMAIL_USER
      }>`,
      to: email,
      subject,
      text,
      html,
    });

    console.log("✅ Email sent successfully!");
    console.log("   Message ID:", info.messageId);
    console.log("   To:", email);
    return true;
  } catch (error) {
    console.error("❌ Email sending failed!");
    console.error("   Error:", error.message);
    console.error("   Code:", error.code);
    console.error("   Command:", error.command);
    console.error("");
    console.error("🔧 Troubleshooting:");

    if (error.code === "EAUTH") {
      console.error("   → Authentication failed");
      console.error("   → Check EMAIL_USER and EMAIL_PASS");
      console.error("   → For Gmail: Use App Password, not regular password");
      console.error(
        "   → Generate App Password: https://myaccount.google.com/apppasswords"
      );
    } else if (error.code === "ECONNECTION") {
      console.error("   → Connection failed");
      console.error("   → Check EMAIL_HOST and EMAIL_PORT");
      console.error("   → Check firewall/network settings");
    } else if (error.code === "ETIMEDOUT") {
      console.error("   → Connection timeout");
      console.error("   → Check network connection");
    }

    console.error("");
    console.error("📧 [EMAIL FAILED] OTP Code for", email, ":", code);
    console.error("   Check backend logs on Render to see this code");

    // Still return true so the flow continues - OTP is saved in database
    return true;
  }
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
