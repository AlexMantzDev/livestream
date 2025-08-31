import { Server } from "socket.io";
import Redis from "ioredis";
import { createAdapter } from "@socket.io/redis-adapter";

export const initSocket = async (httpServer, sessionMiddleware, REDIS_URL) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  io.engine.use(sessionMiddleware);

  // Create Redis clients for pub/sub
  const pubClient = new Redis(REDIS_URL);
  const subClient = pubClient.duplicate();
  const viewClient = pubClient.duplicate();

  // Enable Redis adapter for Socket.IO
  io.adapter(createAdapter(pubClient, subClient));

  // Handle Socket.IO connections
  io.on("connection", (socket) => {
    const session = socket.request.session;
    const user = session?.user;

    if (!user) {
      socket.disconnect();
      return;
    }

    console.log(`Socket connected: ${socket.id} as ${user.username}`);

    socket.on("join-room", async (streamId) => {
      await viewClient.sadd(`liveViewers:${streamId}`, user.username);
      await viewClient.expire(`liveViewers:${streamId}`, 60 * 60); // 1 hour

      console.log(
        `User ${user.username} joined room: ${streamId} with socket ID: ${socket.id}`
      );

      socket.emit("join-room", streamId);
      socket.join(streamId);

      const count = await viewClient.scard(`liveViewers:${streamId}`);
      console.log(`Viewers count for room ${streamId}: ${count}`);
      io.to(streamId).emit("viewers-count", count);
    });

    socket.on("chat-message", ({ streamId, message }) => {
      io.to(streamId).emit("chat-message", {
        sender: user.username,
        message,
      });
    });

    socket.on("disconnect", async () => {
      const rooms = [...socket.rooms].filter((room) => room !== socket.id);
      for (const room of rooms) {
        await viewClient.srem(`liveViewers:${room}`, user.username);
        const count = await viewClient.scard(`liveViewers:${room}`);
        io.to(room).emit("viewers-count", count);
      }
    });
  });

  return io;
};
