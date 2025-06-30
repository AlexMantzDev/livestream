import mongoose from "mongoose";
import dotenv from "dotenv";
import { ConnectionError } from "../../errorHandler/errorHandler.js";

dotenv.config();

const connectToMongo = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `MongoDB connected over ${conn.connection.host}:${conn.connection.port}`
    );
  } catch (error) {
    throw new ConnectionError(error.message);
  }
};

export default connectToMongo;
