import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import { RedisStore } from "connect-redis";
import cors from "cors";

import connectToMongo from "./utils/database/databaseConnect.js";
import connectToRedis, { redisClient } from "./utils/database/redisClient.js";
import { createServer } from "http";

import authRoutes from "./auth/routes/authRoutes.js";
import watchRoutes from "./watch/routes/watchRoutes.js";
import recordingsRoutes from "./recordings/routes/recordingsRoutes.js";
import startNodeMediaServer from "./utils/nodeMediaServer/nms.js";
import { initSocket } from "./utils/webSockets/socket.js";

// Load environment variables
dotenv.config();

// Set up constants for port and interface
const PORT = process.env.PORT || 3000;
const INTERFACE = process.env.INTERFACE || "0.0.0.0";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Get the current file and directory names
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create an Express application
const app = express();

// Create the HTTP server and Socket.IO instance
const httpServer = createServer(app);

// Set up middleware for json parsing
app.use(express.json());

// Set up middleware for session management
const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient, prefix: "session:" }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
});

// Set up CORS headers
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true, // Allow cookies to be sent
  })
);

// Use the session middleware
app.use(sessionMiddleware);

app.use("/api/auth", authRoutes);
app.use("/api/recordings", recordingsRoutes);
app.use("/api/watch", watchRoutes);

app.use(express.static(path.join(__dirname, "..", "client", "dist")));

console.log(
  `Static files served from: ${path.join(__dirname, "..", "client", "dist")}`
);

app.get("/{*any}", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "dist", "index.html"));
});

httpServer.listen(PORT, INTERFACE, async () => {
  await connectToMongo();
  await connectToRedis();
  await initSocket(httpServer, sessionMiddleware, REDIS_URL);
  startNodeMediaServer();
  console.log(`Express server listening on ${INTERFACE}:${PORT}`);
});
