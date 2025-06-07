import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./utils/database/databaseConnect.js";
import connectRedis from "./utils/database/redisClient.js";

import authRoutes from "./auth/routes/authRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use(express.static(path.join(__dirname, "..", "client", "dist")));

console.log(
  `Static files served from: ${path.join(__dirname, "..", "client", "dist")}`
);

app.get("/{*any}", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "dist", "index.html"));
});

app.listen(PORT, async () => {
  await connectDB();
  await connectRedis();

  console.log(`Server is running on port ${PORT}`);
});
