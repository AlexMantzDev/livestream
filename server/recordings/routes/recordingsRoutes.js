import { Router } from "express";
import * as recordingsController from "../controllers/recordingsController.js";
import authenticate from "../../auth/middleware/authenticate.js";

const router = Router();

router.get("/live/", recordingsController.findAllLiveRecordings);
router.get("/live/findByid/:id", recordingsController.findLiveRecordingById);
router.get(
  "/live/findByUserId/:userId",
  recordingsController.findLiveRecordingsByUserId
);

router.get("/", recordingsController.findAllPastRecordings);
router.get("/findByid/:id", recordingsController.findPastRecordingById);
router.get(
  "/findByUserId/:userId",
  recordingsController.findPastRecordingsByUserId
);

router.post("/new", authenticate, recordingsController.createRecording);

router.patch("/edit/:id", authenticate, recordingsController.updateRecording);

router.delete(
  "/delete/:id",
  authenticate,
  recordingsController.deleteRecording
);

export default router;
