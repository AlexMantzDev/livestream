import Recording from "../models/Recording.js";

export const findAllRecordings = async (req, res) => {
  try {
    const recordings = await Recording.find();
    res.status(200).json(recordings);
  } catch (error) {
    console.error("Error fetching recordings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const findRecordingById = async (req, res) => {
  const { id } = req.params;
  try {
    const recording = await Recording.findById(id);
    res.status(200).json(recording);
  } catch (error) {
    console.error("Error fetching recording:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const findRecordingByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const recordings = await Recording.find({ userId });
    res.status(200).json(recordings);
  } catch (error) {
    console.error("Error fetching recordings for user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createRecording = async (req, res) => {
  const { title, description } = req.body;
  try {
    const newRecording = new Recording({
      userId: req.user.id,
      title,
      description,
      flvFilePath: null,
      mp4FilePath: null,
      startTime: null,
      endTime: null,
    });
    await newRecording.save();
    res.status(201).json(newRecording);
  } catch (error) {
    console.error("Error creating recording:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateRecording = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  try {
    const updatedRecording = await Recording.findByIdAndUpdate(
      id,
      {
        title,
        description,
      },
      { new: true }
    );
    if (!updatedRecording) {
      return res.status(404).json({ message: "Recording not found" });
    }
    res.status(200).json(updatedRecording);
  } catch (error) {
    console.error("Error updating recording:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteRecording = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedRecording = await Recording.findByIdAndDelete(id);
    if (!deletedRecording) {
      return res.status(404).json({ message: "Recording not found" });
    }
    res.status(200).json({ message: "Recording deleted successfully" });
  } catch (error) {
    console.error("Error deleting recording:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
