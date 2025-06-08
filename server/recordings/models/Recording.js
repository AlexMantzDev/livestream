import mongoose from "mongoose";

const recordingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    default: "Untitled Recording",
  },
  description: {
    type: String,
    required: true,
    default: "No description provided",
  },
  flvFilePath: {
    type: String,
    required: true,
    default: null,
  },
  mp4FilePath: {
    type: String,
    required: true,
    default: null,
  },
  startTime: {
    type: Date,
    required: true,
    default: null,
  },
  endTime: {
    type: Date,
    required: true,
    default: null,
  },
});

export default mongoose.model("Recording", recordingSchema);
