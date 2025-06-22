import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import flvjs from "flv.js";
import axios from "axios";

const Watch = () => {
  const { recordingId } = useParams();
  const videoRef = useRef(null);
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

  useEffect(() => {
    if (!recordingInfo || !recordingInfo.flvFilePath) return;
    if (flvjs.isSupported()) {
      const flvPlayer = flvjs.createPlayer({
        type: "flv",
        url: `/api/watch/${recordingId}`,
      });
      flvPlayer.attachMediaElement(videoRef.current);
      flvPlayer.load();

      return () => {
        flvPlayer.unload();
        flvPlayer.detachMediaElement();
        flvPlayer.destroy();
      };
    }
  }, [recordingInfo]);

  return (
    <>
      <section className="container py-4">
        <h1 className="mb-4">Watch Streams</h1>
        <p className="lead">
          This page is under construction. Please check back later!
        </p>
        {!recordingInfo ? (
          <p>Loading...</p>
        ) : recordingInfo.mp4FilePath ? (
          <video className="w-100" controls src={`/api/watch/${recordingId}`}>
            Your browser does not support the video tag.
          </video>
        ) : (
          <video ref={videoRef} className="w-100" controls>
            Your browser does not support the video tag.
          </video>
        )}
      </section>
    </>
  );
};

export default Watch;
