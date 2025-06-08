import { Router } from "express";

import * as watchController from "../controllers/watchController.js";

const router = Router();

router.get("/:id", watchController.watchVideo);

export default router;
