import Recording from "../../lib/models/Recording.js";
import fs from "fs";
import { request } from "undici";

import User from "../../api/auth/models/User.js";

export const playRecording = async (req, res) => {
  const { id } = req.params;
  const range = req.headers.range;

  console.log("Requested range:", range);

  try {
    // Find the recording by ID
    const recording = await Recording.findById(id);
    if (!recording) {
      return res.status(404).json({ message: "Recording not found" });
    }

    // Set the video path and type based on available files
    let videoPath = recording.mp4FilePath || recording.flvFilePath;
    const isMp4 = Boolean(recording.mp4FilePath);
    const videoType = isMp4 ? "video/mp4" : "video/x-flv";

    // Verify the video file exists
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ message: "Video file not found" });
    }

    // Get video size and set up stream
    const videoSize = fs.statSync(videoPath).size;

    if (isMp4 && range) {
      const match = range.match(/bytes=(\d+)-(\d+)?/);
      if (!match) {
        return res.status(416).send("Invalid range format");
      }

      const start = parseInt(match[1]);
      const end = match[2] ? parseInt(match[2]) : videoSize - 1;
      const contentLength = end - start + 1;

      if (start >= videoSize || start < 0 || end >= videoSize || start > end) {
        console.error("Invalid range:", start, end, videoSize);
        return res.status(416).send("Requested range not satisfiable");
      }

      const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": videoType,
      };

      res.writeHead(206, headers);
      return fs.createReadStream(videoPath, { start, end }).pipe(res);
    }

    res.writeHead(200, {
      "Content-Length": videoSize,
      "Content-Type": videoType,
    });
    return fs.createReadStream(videoPath).pipe(res);
  } catch (error) {
    console.error("Error watching video:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const playLiveStream = async (req, res) => {
  const recordingId = req.params.id;

  try {
    // Find the recording and user associated with the stream
    const recording = await Recording.findById(recordingId);
    if (!recording) {
      return res.status(404).send("Stream not found");
    }

    // Find the user by userId in the recording
    const user = await User.findById(recording.userId);
    if (!user || !user.streamKey) {
      return res.status(404).send("Invalid user");
    }

    // Construct the stream URL using the user's stream key
    const streamKey = user.streamKey;
    const streamUrl = `http://127.0.0.1:8000/live/${streamKey}.flv`;

    // Make a request to the stream URL
    const { body, statusCode, headers } = await request(streamUrl);

    res.setHeader("Content-Type", "video/x-flv");
    body.pipe(res);
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).send("Stream error");
  }
};
