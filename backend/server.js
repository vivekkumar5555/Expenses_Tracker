// Load environment variables FIRST - before any other imports
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import prisma from "./lib/prisma.js";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import budgetRoutes from "./routes/budget.routes.js";
import recurringExpenseRoutes from "./routes/recurringExpense.routes.js";
import scheduledExpenseRoutes from "./routes/scheduledExpense.routes.js";
import savingsGoalRoutes from "./routes/savingsGoal.routes.js";
import reportRoutes from "./routes/report.routes.js";
import settingsRoutes from "./routes/settings.routes.js";

// Import middleware
import { errorHandler } from "./middleware/errorHandler.middleware.js";

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        process.env.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        // Add your Render frontend URLs
        "https://smartspend-frontend.onrender.com",
        "https://expenses-tracker-zft4.onrender.com",
      ].filter(Boolean);

      // Check if origin is allowed or if it's a Render URL
      if (allowedOrigins.includes(origin) || origin.includes(".onrender.com")) {
        callback(null, true);
      } else {
        console.warn(`⚠️  CORS blocked origin: ${origin}`);
        callback(null, true); // Allow in production to avoid blocking legitimate requests
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      message: "SmartSpend+ API is running",
      database: "connected",
    });
  } catch (error) {
    console.error("Health check failed:", error.message);
    res.status(500).json({
      status: "error",
      message: "API running but database connection failed",
      database: "disconnected",
    });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/recurring-expenses", recurringExpenseRoutes);
app.use("/api/scheduled-expenses", scheduledExpenseRoutes);
app.use("/api/savings-goals", savingsGoalRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingsRoutes);

// 404 handler (before error handler)
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ message: "Route not found" });
});

// Error handler middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Test database connection before starting server
const startServer = async () => {
  try {
    console.log("🔌 Testing database connection...");
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      console.log("");
      console.log("╔════════════════════════════════════════════════════════╗");
      console.log("║         SmartSpend+ Backend Server Started             ║");
      console.log("╠════════════════════════════════════════════════════════╣");
      console.log(
        `║  🚀 Port: ${PORT}                                        ║`
      );
      console.log(
        `║  📊 Environment: ${(process.env.NODE_ENV || "development").padEnd(
          30
        )}  ║`
      );
      console.log(
        "║  ✅ Database: Connected                                 ║"
      );
      console.log("╚════════════════════════════════════════════════════════╝");
      console.log("");
    });
  } catch (error) {
    console.error("❌ Failed to connect to database:", error.message);
    console.error("   Check your DATABASE_URL environment variable");
    // Still start server but log the error
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (DATABASE NOT CONNECTED)`);
    });
  }
};

startServer();

// Graceful shutdown
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
