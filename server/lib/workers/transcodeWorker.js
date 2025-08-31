import { Worker } from "bullmq";
import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import redisClient from "../database/redisClient.js";
import Recording from "../models/Recording.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
try {
  await mongoose.connect(MONGO_URI);
  console.log("MongoDB connected in worker");
} catch (err) {
  console.error("MongoDB connection failed in worker:", err);
  process.exit(1);
}

// Define the transcode worker
const transcodeWorker = new Worker(
  "transcode",
  async (job) => {
    // Extract job data from the transcode job object stored in Redis
    const { recordingId, flvPath, mp4Path, userId, streamKey } = job.data;

    try {
      // Define the transcode process for converting FLV file to MP4 using FFmpeg
      const transcodeToMP4 = async () => {
        return new Promise((resolve, reject) => {
          const ffmpegProcess = spawn(ffmpegPath, [
            "-err_detect",
            "ignore_err",
            "-i",
            flvPath,
            "-c:v",
            "libx264",
            "-c:a",
            "aac",
            "-movflags",
            "faststart",
            "-y",
            mp4Path,
          ]);

          // Log FFmpeg output
          ffmpegProcess.stdout.on("data", (data) => {
            console.log(`[FFmpeg stdout]: ${data}`);
          });

          // Log FFmpeg errors
          ffmpegProcess.stderr.on("data", (data) => {
            console.error(`[FFmpeg stderr]: ${data}`);
          });

          // Handle FFmpeg process close
          ffmpegProcess.on("close", (code) => {
            if (code === 0) {
              resolve(mp4Path);
            } else {
              reject(new Error(`FFmpeg process exited with code ${code}`));
            }
          });
        });
      };

      // Start the transcoding process
      await transcodeToMP4();

      // Delete the original FLV file after successful transcoding
      fs.unlink(flvPath, (err) => {
        if (err) {
          console.error(`Failed to delete FLV file: ${flvPath}`, err);
        } else {
          console.log(`Deleted FLV file: ${flvPath}`);
        }
      });

      // Update the recording in the database with the new MP4 file path
      const updated = await Recording.findByIdAndUpdate(
        recordingId,
        {
          endTime: new Date(),
          flvFilePath: null,
          mp4FilePath: mp4Path,
        },
        { new: true }
      );

      // Log the updated recording for debugging
      console.log(updated);

      console.log(
        `Transcoding completed and recording updated for user ${userId} with stream key ${streamKey}`
      );
    } catch (error) {
      console.error(
        `Error during transcoding for user ${userId} with stream key ${streamKey}:`,
        error
      );
      throw error; // Re-throw the error to mark the job as failed
    }
  },
  { connection: redisClient }
);

// Handle "failed" event for the worker
transcodeWorker.on("failed", (job, err) => {
  console.error(
    `Transcoding job failed for user ${job.data.userId} with stream key ${job.data.streamKey}:`,
    err
  );
});
