import Recording from "../../models/Recording.js";

export const createRecording = async (streamData) => {
  const {
    _id,
    title,
    description,
    userId,
    flvFilePath = null,
    mp4FilePath = null,
    startTime = null,
    endTime = null,
  } = streamData;
  try {
    const newRecording = new Recording({
      _id,
      userId,
      title,
      description,
      flvFilePath,
      mp4FilePath,
      startTime,
      endTime,
    });
    console.log("Saving new recording:", newRecording);
    const result = await newRecording.save();
    if (!result) {
      throw new Error("Failed to create recording");
    }
    return newRecording;
  } catch (error) {
    console.error("Error creating recording:", error);
    throw new Error("Internal server error");
  }
};

export const findAllRecordings = async () => {
  try {
    const recordings = await Recording.find();
    return recordings;
  } catch (error) {
    console.error("Error fetching recordings:", error);
    throw new Error("Internal server error");
  }
};

export const findRecordingById = async (id) => {
  try {
    const recording = await Recording.findById(id);
    return recording;
  } catch (error) {
    console.error("Error fetching recording:", error);
    throw new Error("Internal server error");
  }
};

export const updateRecording = async (id, streamData) => {
  const { title, description, flvFilePath, mp4FilePath, startTime, endTime } =
    streamData;
  try {
    const foundRecording = await Recording.findByIdAndUpdate(
      id,
      { title, description, flvFilePath, mp4FilePath, startTime, endTime },
      { new: true }
    ).lean();
    if (!foundRecording) {
      throw new Error("Recording not found");
    }
    return foundRecording;
  } catch (error) {
    console.error("Error updating recording:", error);
    throw new Error("Internal server error");
  }
};

export const deleteRecording = async (id) => {
  try {
    const deleted = await Recording.findByIdAndDelete(id);
    if (!deleted) {
      throw new Error("Recording not found");
    }
    return deleted;
  } catch (error) {
    console.error("Error deleting recording:", error);
    throw new Error("Internal server error");
  }
};
