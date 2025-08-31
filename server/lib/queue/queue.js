import { Queue } from "bullmq";
import redisClient from "../database/redisClient.js";

export const transcodeQueue = new Queue("transcode", {
  connection: redisClient,
});
