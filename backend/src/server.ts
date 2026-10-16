import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";
import "dotenv/config";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import pool from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import { registerChatSocket } from "./sockets/chat.socket.js";

const app = express();
const httpServer = createServer(app);

const PORT = Number(process.env.PORT ?? 5000);
const CLIENT_URL =
  process.env.CLIENT_URL ?? "http://localhost:3000";

// Security headers
app.use(helmet());

// Configure CORS for the Next.js frontend
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// Parse incoming JSON and cookies
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Root route
app.get("/", (_req, res) => {
  res.send("Chat API is running!");
});

// PostgreSQL health check
app.get("/health/db", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT NOW() AS database_time"
    );

    res.json({
      status: "ok",
      message: "PostgreSQL connected successfully",
      databaseTime: result.rows[0].database_time,
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Create ONE Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Register authenticated chat socket handlers
registerChatSocket(io);

// Start the HTTP server
httpServer.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
