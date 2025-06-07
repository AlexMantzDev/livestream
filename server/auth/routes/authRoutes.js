import { Router } from "express";
import * as authController from "../controllers/authController.js";
import authenticate from "../middleware/authenticate.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/logout", authenticate, authController.logout);
router.get("/verify", authenticate, authController.verifyUser);

export default router;
