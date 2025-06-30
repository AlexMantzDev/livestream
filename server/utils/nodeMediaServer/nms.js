import NodeMediaServer from "node-media-server";
import User from "../../auth/models/User.js";
import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";
import { redisClient } from "../database/redisClient.js";
import Recording from "../../recordings/models/Recording.js";
import fs from "fs";

// Stores FFmpeg processes and file paths
const activeStreams = new Map();

const directories = ["./public/live", "./public/recordings"];

directories.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

const transcodeToMP4 = async (inputFile, outputFile) => {
  return new Promise((resolve, reject) => {
    // Start the FFMpeg process to transcode the FLV file to MP4
    const ffmpegProcess = spawn(ffmpegPath, [
      "-err_detect",
      "ignore_err",
      "-i",
      inputFile,
      "-c:v",
      "libx264",
      "-c:a",
      "aac",
      "-movflags",
      "faststart",
      "-y",
      outputFile,
    ]);

    // Handle FFmpeg process output
    ffmpegProcess.stdout.on("data", (data) =>
      console.log(`FFmpeg stdout: ${data}`)
    );

    // Handle FFmpeg process errors
    ffmpegProcess.stderr.on("data", (data) =>
      console.error(`FFmpeg stderr: ${data}`)
    );

    // Handle FFmpeg process close event
    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        // Transcoding successful
        resolve(outputFile);
      } else {
        // Transcoding failed
        reject(new Error(`FFmpeg process exited with code ${code}`));
      }
    });
  });
};

// Start the FFmpeg process to record the stream as FLV
const recordToFlv = (inputUrl, outputFile) => {
  const ffmpegProcess = spawn(ffmpegPath, [
    "-i",
    inputUrl,
    "-c",
    "copy",
    "-f",
    "flv",
    outputFile,
  ]);

  // Handle FFmpeg process output
  ffmpegProcess.stdout.on("data", (data) =>
    console.log(`FFmpeg stdout: ${data}`)
  );

  // Handle FFmpeg process errors
  ffmpegProcess.stderr.on("data", (data) =>
    console.error(`FFmpeg stderr: ${data}`)
  );

  return ffmpegProcess;
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
const startNodeMediaServer = () => {
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

    console.log(`[${id}] Stream started, recording...`);

    const inputUrl = `rtmp://localhost:1935${streamPath}`;
    const outputFile = `./public/live/${streamKey}-${Date.now()}.flv`;

    // Check if the stream key is valid
    const user = await User.findOne({ streamKey: streamKey });
    if (!user) {
      console.error(`No user found for stream key: ${streamKey}`);
      session.socket.destroy();
      return;
    }

    // Look for an existing entity for a recording that hasn't been started yet
    const record = await Recording.findOneAndUpdate(
      {
        userId: user._id,
        startTime: null,
      },
      {
        userId: user._id,
        startTime: new Date(),
        flvFilePath: outputFile,
      },
      { new: true, upsert: true }
    );
    if (!record) {
      console.error(
        `Failed to create or update recording for user: ${user._id}`
      );
      session.socket.destroy();
      return;
    }

    // start the process to record the stream using FFmpeg
    const ffmpegProcess = recordToFlv(inputUrl, outputFile);

    // Save process to activeStreams map
    activeStreams.set(id, {
      ffmpegProcess,
      outputFile,
    });

    // Save live stream info to Redis
    await redisClient.setEx(
      `live:${streamKey}`,
      3600, // 1 hour expiration
      JSON.stringify({
        sessionId: id,
        createdAt: Date.now(),
      })
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
      active.ffmpegProcess.on("exit", (code) => {
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
      active.ffmpegProcess.kill("SIGTERM");

      // Remove from activeStreams
      activeStreams.delete(id);
      console.log(`Recording stopped for stream: ${streamPath}`);

      // Get the output file path and MP4 file name
      const outputFile = active.outputFile;
      const mp4File = `./public/recordings/${streamKey}-${Date.now()}.mp4`;

      // Transcode the FLV file to MP4
      console.log(`Starting transcoding to MP4: ${mp4File}`);
      try {
        await transcodeToMP4(outputFile, mp4File);
        console.log(`Transcoding completed: ${mp4File}`);

        // Remove the original FLV file
        fs.unlink(outputFile, (error) => {
          if (error) {
            console.error(`Error removing FLV file: ${error.message}`);
          } else {
            console.log(`FLV file removed: ${outputFile}`);
          }
        });
      } catch (error) {
        console.error(`Error during transcoding: ${error.message}`);
        return;
      }

      // Update the recording in the database
      console.log(`Updating recording in database for stream: ${streamKey}`);
      try {
        await Recording.findOneAndUpdate(
          {
            userId: user._id,
            startTime: { $ne: null },
            endTime: null,
          },
          {
            endTime: new Date(),
            flvFilePath: null,
            mp4FilePath: mp4File,
          },
          { new: true }
        );
      } catch (error) {
        console.error(`Error updating recording in database: ${error.message}`);
      }
    } else {
      console.log(`No active recording found for stream: ${streamPath}`);
    }
  });
};

export default startNodeMediaServer;
