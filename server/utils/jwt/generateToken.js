import jwt from "jsonwebtoken";
import dotenv from "../../config";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
};

export default generateToken;
