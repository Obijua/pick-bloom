/*
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // For local dev, you can use: mongodb://localhost:27017/freshfarm
    // For production, use your Atlas connection string from .env
    const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/freshfarm';
    
    console.log(`Attempting to connect to MongoDB...`);

    const conn = await mongoose.connect(connStr);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Re-throw error so server.js can handle startup failure
    throw error;
  }
};

module.exports = connectDB;
*/




const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const connStr =
      process.env.MONGO_URI || "mongodb://localhost:27017/freshfarm";

    console.log("Attempting to connect to MongoDB...");

    const conn = await mongoose.connect(connStr, {
      maxPoolSize: 10,                 // 🔒 prevent pool exhaustion
      serverSelectionTimeoutMS: 30000, // ⏱ Atlas server timeout
      socketTimeoutMS: 45000,          // ⏱ long-running queries
      heartbeatFrequencyMS: 10000,     // ❤️ keep connection alive
    });

    isConnected = true;

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Retrying...");
      isConnected = false;
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB error:", err);
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1); // 🚨 fail fast in production
  }
};

module.exports = connectDB;

