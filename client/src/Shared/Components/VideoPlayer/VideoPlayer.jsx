import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import flvjs from "flv.js";
import axios from "axios";
import { useRecording } from "../../Contexts/Recording/RecordingContext";

import "./VideoPlayer.css";

const FLV_URL_BASE = "/api/watch/live/";

const VideoPlayer = ({ onToggleChat, chatVisible }) => {
  const videoRef = useRef(null);
  const wrapperRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [prevVolume, setPrevVolume] = useState(1);
  const { recordingId, recordingInfo } = useRecording();

  // Initialize video player
  useEffect(() => {
    if (!recordingInfo) return;

    const video = videoRef.current;
    if (!video) return;

    let flvPlayer = null;

    // Attach native or FLV.js source
    if (recordingInfo.flvFilePath && flvjs.isSupported()) {
      setIsLive(true);
      flvPlayer = flvjs.createPlayer({
        type: "flv",
        url: `${FLV_URL_BASE}${recordingInfo._id}`,
        isLive: true,
        enableStashBuffer: true,
        stashInitialSize: 128,
      });

      flvPlayer.attachMediaElement(video);
      flvPlayer.load();
      video.muted = true; // Mute initially to avoid autoplay issues
      setIsMuted(true);

      flvPlayer.play();
    } else if (recordingInfo.mp4FilePath) {
      video.src = `/api/watch/${recordingId}`; // Set src for native MP4
    }

    // Attach event listeners (works for both FLV and native)
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);

      if (flvPlayer) {
        flvPlayer.unload();
        flvPlayer.detachMediaElement();
        flvPlayer.destroy();
      }
    };
  }, [recordingInfo, recordingId]);

  // Handle play/pause events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => {
      setIsPlaying(false);
      setControlsVisible(true);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  // Handle timeout for video UI opacity
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Handle keyboard shortcuts for video controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const video = videoRef.current;
      if (!video) return;

      switch (e.key) {
        case "ArrowRight":
          video.currentTime += 10;
          break;
        case "ArrowLeft":
          video.currentTime -= 10;
          break;
        case "ArrowUp":
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.05);
          setVolume(video.volume);
          break;
        case "ArrowDown":
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.05);
          setVolume(video.volume);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle mouse move to show controls
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

    hideTimeoutRef.current = setTimeout(() => {
      if (!videoRef.current?.paused) {
        setControlsVisible(false);
      }
    }, 3000);
  };

  // Handle play/pause toggle
  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setControlsVisible(true);
    }
  };

  // Handle time update and progress bar
  const handleTimeUpdate = () => {
    if (isLive) return; // Skip updates for live streams
    const video = videoRef.current;
    if (video) {
      const progress = (video.currentTime / video.duration) * 100;
      setCurrentTime(video.currentTime);

      const slider = document.querySelector(".progress-bar-full");
      if (slider) {
        slider.style.background = `linear-gradient(to right, #00c4ff ${progress}%, #aaa ${progress}%)`;
      }

      const buffered = video.buffered;
      if (buffered.length) {
        setBufferedEnd(buffered.end(buffered.length - 1));
      }
    }
  };

  // Handle metadata loaded to set duration and initial time
  const handleLoadedMetadata = () => {
    if (isLive) return; // Skip for live streams

    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setCurrentTime(videoRef.current.currentTime);
      setVolume(videoRef.current.volume);
    }
  };

  // Handle seeking and volume changes
  const handleSeek = (e) => {
    if (!videoRef.current) return;

    const seekTime = parseFloat(e.target.value);
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // Handle volume changes
  const handleVolumeChange = (e) => {
    if (!videoRef.current) return;

    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  // Handle mute toggle
  const handleToggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const isNowMuted = !video.muted;
    video.muted = isNowMuted;
    setIsMuted(isNowMuted);

    if (isNowMuted) {
      setPrevVolume(video.volume); // save current volume
      setVolume(0); // move slider to 0
    } else {
      video.volume = prevVolume; // restore actual volume
      setVolume(prevVolume);
    }
  };

  // Format time in MM:SS
  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  // Skip forward (unused)
  const skipForward = () => {
    const video = videoRef.current;
    if (video) video.currentTime += 10;
  };

  // Skip backward (unused)
  const skipBackward = () => {
    const video = videoRef.current;
    if (video) video.currentTime -= 10;
  };

  // Toggle fullscreen mode
  const handleToggleFullscreen = () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    if (!document.fullscreenElement) {
      wrapper.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle playback speed change
  const handleSpeedChange = (e) => {
    const rate = parseFloat(e.target.value);
    const video = videoRef.current;
    if (video) {
      video.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  if (!recordingInfo) return <p>Loading...</p>;

  return (
    <div
      style={{ backgroundColor: "#333" }}
      className="d-flex justify-content-center align-items-center"
    >
      <div
        ref={wrapperRef}
        className="video-wrapper"
        onMouseMove={handleMouseMove}
      >
        {/* {isLive && (
          <div className="live-indicator">
            <span className="dot" /> Live
          </div>
        )} */}
        <video ref={videoRef} preload="metadata" onClick={handlePlayPause} />
        {!isLive && (
          <div
            className={`video-progress-bar-wrapper ${
              controlsVisible ? "visible" : "hidden"
            }`}
          >
            <div
              className="buffered-bar"
              style={{
                width: `${(bufferedEnd / duration) * 100 || 0}%`,
              }}
            ></div>
            <div
              className="played-bar"
              style={{
                width: `${(currentTime / duration) * 100 || 0}%`,
              }}
            ></div>

            <input
              type="range"
              min={0}
              max={duration || 0}
              step="0.1"
              value={isNaN(currentTime) ? 0 : currentTime}
              onChange={handleSeek}
              className="progress-bar-full"
            />
          </div>
        )}
        <div
          className={`video-controls-overlay ${
            controlsVisible ? "visible" : "hidden"
          }`}
        >
          <div className="left-controls">
            <button onClick={handlePlayPause}>
              {isPlaying ? (
                <i class="bi bi-pause"></i>
              ) : (
                <i class="bi bi-play"></i>
              )}
            </button>

            <span className="video-time-display">
              {isLive
                ? "🔴 LIVE"
                : `${formatTime(currentTime)} / ${formatTime(duration)}`}
            </span>
            <button onClick={skipBackward}>
              <i class="bi bi-arrow-counterclockwise"></i>
            </button>
            <button onClick={skipForward}>
              <i class="bi bi-arrow-clockwise"></i>
            </button>
            <button onClick={handleToggleMute}>
              {isMuted ? (
                <i class="bi bi-volume-mute"></i>
              ) : volume > 0.5 ? (
                <i class="bi bi-volume-up"></i>
              ) : volume > 0 ? (
                <i class="bi bi-volume-down"></i>
              ) : (
                <i class="bi bi-volume-off"></i>
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-bar"
            />
          </div>

          <div className="right-controls">
            <button onClick={onToggleChat}>
              {chatVisible ? (
                <i class="bi bi-x-circle"></i>
              ) : (
                <i class="bi bi-chat-left-dots"></i>
              )}
            </button>
            <select
              value={playbackRate}
              onChange={handleSpeedChange}
              className="playback-rate-select"
            >
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
            </select>
            <button onClick={handleToggleFullscreen}>
              {!isFullscreen ? (
                <i class="bi bi-fullscreen"></i>
              ) : (
                <i class="bi bi-fullscreen-exit"></i>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

//! Cannot fullscreen video
// TODO: Add resolution selector
// TODO: Add settings submenu
