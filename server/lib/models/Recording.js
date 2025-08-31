import mongoose from "mongoose";

const recordingSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    flvFilePath: {
      type: String,
      default: null,
    },
    mp4FilePath: {
      type: String,
      default: null,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, _id: false }
);

export default mongoose.model("Recording", recordingSchema);
