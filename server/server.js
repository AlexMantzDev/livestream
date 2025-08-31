import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import { RedisStore } from "connect-redis";
import cors from "cors";
import { createServer } from "http";

import connectToMongo from "./lib/database/databaseConnect.js";
import redisClient from "./lib/database/redisClient.js";

import authRoutes from "./api/auth/routes/authRoutes.js";
import watchRoutes from "./watch/routes/watchRoutes.js";
import startNodeMediaServer from "./lib/nodeMediaServer/nms.js";
import { initSocket } from "./lib/webSockets/socket.js";

import { makeStreamService } from "./lib/services/stream/stream.service.js";
import { registerRecordingHandlers } from "./lib/events/handlers/recording.handlers.js";
import { EventBus } from "./lib/events/eventBus.js";

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

// Connect to MongoDB
await connectToMongo();

// Initialize the event bus and register event handlers
const eventBus = new EventBus();
registerRecordingHandlers(eventBus);

// Initialize the stream service
const streamService = makeStreamService(eventBus);
app.locals.streamService = streamService;

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

// Initialize Socket.IO with session support
await initSocket(httpServer, sessionMiddleware, REDIS_URL);

// Start the NodeMediaServer
startNodeMediaServer(streamService, redisClient);

// Set up middleware for json parsing
app.use(express.json());

// Set up CORS settings
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true, // Allow cookies to be sent
  })
);

// Use the session middleware
app.use(sessionMiddleware);

// Set up API routes
app.use("/api/auth", authRoutes);
app.use("/api/watch", watchRoutes);

// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, "..", "client", "dist")));

// Serve the index.html file for all other routes
app.get("/{*any}", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "dist", "index.html"));
});

// Start the HTTP server and initialize the Socket.IO instance
httpServer.listen(PORT, INTERFACE, () => {
  console.log(`Express server listening on ${INTERFACE}:${PORT}`);
});
