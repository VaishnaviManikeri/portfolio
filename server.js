// backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load .env variables
dotenv.config();

const app = express();

// ===============================
// Check Environment Variables
// ===============================
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

// ===============================
// Middleware
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// CORS Configuration
// ===============================
app.use(
  cors({
    origin: [
      "https://vaishnavimanikeriportfolio.netlify.app",
      "http://localhost:3000",
      "http://192.168.1.7:3000",
      process.env.FRONTEND_URL,
    ],
    credentials: true,
  })
);

// ===============================
// MongoDB Connection
// ===============================
const connectDB = async () => {
  try {
    // Check if MONGO_URI exists
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// Connect Database
connectDB();

// ===============================
// Routes
// ===============================
app.get("/", (req, res) => {
  res.send("Backend API Running Successfully 🚀");
});

app.use("/api/projects", require("./routes/projects"));
app.use("/api/admin", require("./routes/admin"));

// ===============================
// 404 Route Handler
// ===============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// ===============================
// Error Handling Middleware
// ===============================
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ===============================
// Server Start
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
