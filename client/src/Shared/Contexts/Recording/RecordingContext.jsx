// context/RecordingContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const RecordingContext = createContext(null);

export const useRecording = () => useContext(RecordingContext);

export const RecordingProvider = ({ recordingId, children }) => {
  const [recordingInfo, setRecordingInfo] = useState(null);

  useEffect(() => {
    const loadRecordingInfo = async () => {
      try {
        const response = await axios.get(
          `/api/recordings/findByid/${recordingId}`
        );
        const data = response.data;
        setRecordingInfo(data);
      } catch (error) {
        console.error("Error loading recording info:", error);
      }
    };
    if (recordingId) {
      loadRecordingInfo();
    }
  }, [recordingId]);

  return (
    <RecordingContext.Provider value={{ recordingId, recordingInfo }}>
      {children}
    </RecordingContext.Provider>
  );
};
