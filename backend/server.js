
require('dotenv').config();


const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Routes
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const seedRoutes = require("./routes/seedRoutes");
const vendorRoutes = require("./routes/vendorRoutes");

// Load env vars FIRST
dotenv.config();

const app = express();

/* =========================
   MIDDLEWARE
========================= */

// CORS (safe for dev + prod)
app.use(
  cors({
    origin: "*", // 🔒 tighten later for production
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logger (keep this — it's helpful)
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );
  next();
});

/* =========================
   ROUTES
========================= */

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "FreshFarm API is running",
  });
});

app.get("/api", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "API Root is reachable",
  });
});

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/seed", seedRoutes);

/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`,
  });
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  const statusCode = res.statusCode && res.statusCode !== 200
    ? res.statusCode
    : 500;

  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

/* =========================
   SERVER START
========================= */

const PORT = process.env.PORT || 5000;



const startServer = async () => {
  try {
    await connectDB(); // Ensure DB is ready first
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};


/*
const startServer = async () => {
  try {
    // 1. Start listening FIRST
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });

    // 2. Connect to DB SECOND (don't 'await' it if you want the server up now)
    connectDB(); 
    
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};
*/


startServer();

/* =========================
   GRACEFUL SHUTDOWN
========================= */

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

