import { Router } from "express";
import * as recordingsController from "../controllers/recordingsController.js";
import authenticate from "../../auth/middleware/authenticate.js";

const router = Router();

router.get("/", recordingsController.findAllRecordings);
router.get("/findByid/:id", recordingsController.findRecordingById);
router.get("/findByUserId/:userId", recordingsController.findRecordingByUserId);

router.post("/new", authenticate, recordingsController.createRecording);

router.patch("/edit/:id", authenticate, recordingsController.updateRecording);

router.delete(
  "/delete/:id",
  authenticate,
  recordingsController.deleteRecording
);

export default router;
