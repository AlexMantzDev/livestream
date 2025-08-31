import crypto from "crypto";
import * as recordingRepo from "../../repo/recordings/recordings.repo.js";

export const makeStreamService = (eventBus) => {
  const beginStream = async (userId, streamData) => {
    const { title, description } = streamData;
    const recordingId = crypto.randomUUID();
    const startedAt = new Date();
    const recording = await recordingRepo.createRecording({
      _id: recordingId,
      userId,
      title,
      description,
      startTime: startedAt,
    });
    await recording.save();
    eventBus.emit("stream.start", { recordingId, userId, startedAt });
    return { recordingId, startedAt };
  };

  const endStream = async (recordingId, streamData) => {
    const { mp4FilePath } = streamData;
    const endedAt = new Date();
    const { userId } = await recordingRepo.updateRecording(recordingId, {
      mp4FilePath,
      endTime: endedAt,
    });
    eventBus.emit("stream.end", { recordingId, userId, endedAt });
    return { recordingId, endedAt };
  };

  return { beginStream, endStream };
};
