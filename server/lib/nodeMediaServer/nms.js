import NodeMediaServer from "node-media-server";
import User from "../../api/auth/models/User.js";
import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";

import fs from "fs";
import { transcodeQueue } from "../queue/queue.js";
import path from "path";

// Stores FFmpeg processes and file paths
const activeStreams = new Map();

// Ensure the necessary directories exist
const directories = ["./public/live", "./public/recordings"];
directories.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Start the FFmpeg process to record the stream as FLV
const recordToFlv = (inputUrl, fileName) => {
  // Define the file path for the FLV recording
  const filePath = path.resolve("public", "live", `${fileName}.flv`);

  // Start the FFmpeg process to record the stream
  const ffmpeg = spawn(ffmpegPath, [
    "-y",
    "-i",
    inputUrl,
    "-c",
    "copy",
    "-f",
    "flv",
    filePath,
  ]);

  // Handle FFmpeg process output
  ffmpeg.stdout.on("data", (data) => console.log(`FFmpeg stdout: ${data}`));

  // Handle FFmpeg process errors
  ffmpeg.stderr.on("data", (data) => console.error(`FFmpeg stderr: ${data}`));

  // Return the FFmpeg process for later management
  return { ffmpeg, filePath };
};

// Configuration for NodeMediaServer
const config = {
  bind: "127.0.0.1",
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    host: "0.0.0.0",
    port: 8000,
    allow_origin: "*",
  },
  trans: {
    ffmpeg: ffmpegPath,
    tasks: [
      {
        app: "live",
        hls: false,
        dash: false,
        flv: true, // Enable FLV output
      },
    ],
  },
};

// Initialize NodeMediaServer with the configuration
export default function startNodeMediaServer(streamService, redisClient) {
  console.log("NodeMediaServer is starting...");
  const nms = new NodeMediaServer(config);
  nms.run();

  // Validate stream key before publishing
  nms.on("prePublish", async (session, args) => {
    const streamKey = session.streamPath.split("/").pop();

    try {
      // Check if the stream key is valid
      const user = await User.findOne({ streamKey: streamKey });
      if (!user) {
        console.error(`No user found for stream key: ${streamKey}`);
        session.socket.destroy();
        return;
      }
    } catch (error) {
      console.error(`Error validating stream key: ${error.message}`);
      session.socket.destroy();
      return;
    }
  });

  // Start recording when a stream is published
  nms.on("postPublish", async (session, args) => {
    const id = session.id;
    const streamPath = session.streamPath;
    const streamKey = streamPath.split("/").pop();
    const streamConnectionUrl = `rtmp://localhost:1935${streamPath}`;
    const fileName = `${streamKey}-${Date.now()}`;

    console.log(`[${id}] Stream started, recording...`);

    // Get the user based on the stream key
    const user = await User.findOne({ streamKey: streamKey });
    if (!user) {
      console.error(`No user found for stream key: ${streamKey}`);
      session.socket.destroy();
      return;
    }

    // start the process to record the stream using FFmpeg
    const { ffmpeg, filePath: flvFilePath } = recordToFlv(
      streamConnectionUrl,
      fileName
    );

    // Save the recording to the database
    const { recordingId } = await streamService.beginStream(user._id, {
      title: "undefined",
      description: "undefined",
      flvPath: flvFilePath,
    });
    console.log(`Recording started with ID: ${recordingId}`);

    // Save process to activeStreams map
    activeStreams.set(id, {
      recordingId,
      ffmpeg,
      fileName,
      flvFilePath,
    });

    // Save live stream info to Redis
    await redisClient.set(
      `live:${streamKey}`,
      JSON.stringify({
        sessionId: id,
        createdAt: Date.now(),
      }),
      "EX",
      3600 // 1 hour expiration
    );
  });

  // Handle stream end and stop recording
  nms.on("donePublish", async (session, args) => {
    const id = session.id;
    const streamPath = session.streamPath;
    const streamKey = streamPath.split("/").pop();

    // Check if the stream key is valid
    const user = await User.findOne({ streamKey: streamKey });
    if (!user) {
      console.error(`No user found for stream key: ${streamKey}`);
      return;
    }

    console.log(`[${id}] Stream ended, stopping recording for: ${streamKey}`);

    // Remove from Redis
    try {
      await redisClient.del(`live:${streamKey}`);
    } catch (error) {
      console.error(`Error removing live stream from Redis: ${error.message}`);
    }

    // Stop the FFmpeg process & get the recorded file
    const active = activeStreams.get(id);
    if (active) {
      // Stop the FFmpeg process
      console.log(active.ffmpeg);
      active.ffmpeg.on("exit", (code) => {
        if (code === 0) {
          console.log(
            `FFmpeg process for stream ${streamKey} exited successfully.`
          );
        } else {
          console.error(
            `FFmpeg process for stream ${streamKey} exited with code ${code}.`
          );
        }
      });
      active.ffmpeg.kill("SIGTERM");

      // Define paths for FLV and MP4 files
      const flvPath = path.resolve("public", "live", `${active.fileName}.flv`);
      const mp4Path = path.resolve(
        "public",
        "recordings",
        `${active.fileName}.mp4`
      );

      // Remove from activeStreams
      activeStreams.delete(id);
      console.log(`Recording stopped for stream: ${streamPath}`);

      // Transcode the FLV file to MP4
      console.log(`Starting transcoding to MP4: ${mp4Path}`);
      try {
        await transcodeQueue.add("transcode", {
          recordingId: active.recordingId,
          flvPath,
          mp4Path,
          userId: user._id.toString(),
          streamKey: streamKey,
        });
      } catch (error) {
        console.error(`Error during transcoding: ${error.message}`);
        return;
      }
      console.log(
        `Transcoding job added for recording ID: ${active.recordingId}`
      );
      // Update the recording in the database
      await streamService.endStream(active.recordingId, {
        mp4FilePath: mp4Path,
      });
    } else {
      console.log(`No active recording found for stream: ${streamPath}`);
    }
  });
}
