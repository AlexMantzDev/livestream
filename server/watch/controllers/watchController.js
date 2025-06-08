import Recording from "../../recordings/models/Recording.js";
import fs from "fs";

export const watchVideo = async (req, res) => {
  const { id } = req.params;
  const range = req.headers.range;
  try {
    console.log("Watching video with ID:", id);
    // Find the recording by ID
    const recording = await Recording.findById(id);
    if (!recording) {
      return res.status(404).json({ message: "Recording not found" });
    }

    // Set the video path and type based on available files
    let videoPath = null;
    let videoType = null;
    if (recording.flvFilePath) {
      videoPath = recording.flvFilePath;
      videoType = "video/x-flv";
    } else if (recording.mp4FilePath) {
      videoPath = recording.mp4FilePath;
      videoType = "video/mp4";
    } else {
      return res.status(404).json({ message: "No video file available" });
    }

    // Verify the video file exists
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ message: "Video file not found" });
    }

    const videoSize = fs.statSync(videoPath).size;

    const CHNUNK_SIZE = 10 ** 6; // 1 MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHNUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": videoType,
    };

    if (start >= videoSize || end >= videoSize || start > end) {
      return res.status(416).send("Requested range not satisfiable");
    }

    res.writeHead(206, headers);

    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
  } catch (error) {
    console.error("Error watching video:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
