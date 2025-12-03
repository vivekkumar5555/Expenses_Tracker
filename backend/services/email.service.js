import nodemailer from "nodemailer";

// Create transporter only if email credentials are configured
let transporter = null;

const createTransporter = () => {
  if (transporter) return transporter;
  
  // Check if email is configured
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Email service not configured. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS');
    return null;
  }
  
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_PORT === "465",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  
  return transporter;
};

export const sendOTPEmail = async (email, code, type = "password_reset") => {
  // Always log the OTP code first - critical for debugging
  console.log('📧 [OTP CODE]', code, 'for', email);
  
  const transport = createTransporter();
  
  // If email is not configured, log the OTP and return immediately
  if (!transport) {
    console.log('⚠️  [EMAIL NOT CONFIGURED] OTP Code:', code);
    console.log('⚠️  [EMAIL NOT CONFIGURED] Email:', email);
    console.log('⚠️  [EMAIL NOT CONFIGURED] Type:', type);
    console.log('⚠️  Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env');
    return true;
  }
  
  // Send email in background - don't wait for it
  // Use setTimeout to ensure it doesn't block
  setTimeout(async () => {
    try {
      const subject =
        type === "password_reset"
          ? "SmartSpend+ - Password Reset Code"
          : "SmartSpend+ - Email Verification Code";

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">SmartSpend+</h2>
          <p>Your ${
            type === "password_reset" ? "password reset" : "verification"
          } code is:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #6366f1; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p style="color: #6b7280; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `;

      // Add timeout to email sending
      const emailPromise = transport.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject,
        html,
      });
      
      // Wait max 5 seconds for email
      await Promise.race([
        emailPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Email timeout')), 5000)
        )
      ]);
      
      console.log('✅ Email sent successfully to:', email);
    } catch (error) {
      console.error("❌ Email sending error:", error.message);
      console.log('📧 [EMAIL FAILED] OTP Code for', email, ':', code);
      console.log('📧 [EMAIL FAILED] Check email credentials in .env');
    }
  }, 0); // Execute immediately but asynchronously
  
  // Return immediately - don't wait for email
  return true;
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


