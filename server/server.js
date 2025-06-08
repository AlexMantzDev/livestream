import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./utils/database/databaseConnect.js";
import connectRedis from "./utils/database/redisClient.js";

import authRoutes from "./auth/routes/authRoutes.js";
import watchRoutes from "./watch/routes/watchRoutes.js";
import recordingsRoutes from "./recordings/routes/recordingsRoutes.js";
import startNodeMediaServer from "./utils/nodeMediaServer/nms.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const PORT = process.env.PORT || 3000;
const INTERFACE = process.env.INTERFACE || "0.0.0.0";

app.use(express.json());

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

app.listen(PORT, INTERFACE, async () => {
  await connectDB();
  await connectRedis();
  startNodeMediaServer();
  console.log(`Express server listening on ${INTERFACE}:${PORT}`);
});
