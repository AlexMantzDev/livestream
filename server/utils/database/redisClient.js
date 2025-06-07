import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (err) => console.error("Redis Client Error", err));

const connectRedis = async () => {
  try {
    await client.connect();
    console.log(`Redis Connnected: ${new URL(client.options.url).hostname}`);
  } catch (error) {
    console.error(`Error connecting to Redis: ${error.message}`);
    process.exit(1);
  }
};

export default connectRedis;
