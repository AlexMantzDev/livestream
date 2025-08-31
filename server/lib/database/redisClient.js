import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const REDIS_URL = process.env.REDIS_URL;

const redisClient = new Redis(REDIS_URL, { maxRetriesPerRequest: null });

export default redisClient;
