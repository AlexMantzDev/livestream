import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  withCredentials: true,
});

export default function SocketTest() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      socket.emit("join-room", "test-room123");
      socket.emit("chat-message", {
        streamId: "test-room123",
        message: "Hello from React!",
      });
    });

    socket.on("join-room", (streamId) => {
      console.log(`✅ Joined room: ${streamId}`);
    });

    socket.on("viewers-count", (count) => {
      console.log(`✅ Viewers count updated: ${count}`);
    });

    return () => socket.disconnect();
  }, []);

  return <div>Socket test active. Check the console.</div>;
}
