import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

const connectRedis = async () => {
  try {
    await redisClient.connect();
    const connection = new URL(redisClient.options.url);
    console.log(
      `Redis Connnected over ${connection.hostname}:${connection.port}`
    );
  } catch (error) {
    console.error(`Error connecting to Redis: ${error.message}`);
    process.exit(1);
  }
};

export default connectRedis;
