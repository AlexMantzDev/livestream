import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

export const initSocket = async (httpServer, sessionMiddleware, REDIS_URL) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  io.engine.use(sessionMiddleware);

  // Create Redis clients for socket pub/sub
  const pubClient = createClient({ url: REDIS_URL });
  const subClient = pubClient.duplicate();

  try {
    // Connect to Redis for socket pub/sub
    await pubClient.connect();
    await subClient.connect();
  } catch (error) {
    console.error(`Error connecting to Redis: ${error.message}`);
    throw new Error("Redis connection failed");
  }

  // Create Redis clients for views
  const viewClient = createClient({ url: REDIS_URL });

  try {
    // Connect to Redis for views
    await viewClient.connect();
  } catch (error) {
    console.error(`Error connecting to Redis for views: ${error.message}`);
    throw new Error("Redis view connection failed");
  }

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
      await viewClient.sAdd(`liveViewers:${streamId}`, user.username);
      await viewClient.expire(`liveViewers:${streamId}`, 60 * 60); // 1 hour

      console.log(
        `User ${user.username} joined room: ${streamId} with socket ID: ${socket.id}`
      );

      socket.emit("join-room", streamId);
      socket.join(streamId);

      const count = await viewClient.sCard(`liveViewers:${streamId}`);
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
        await viewClient.sRem(`liveViewers:${room}`, user.username);
        const count = await viewClient.sCard(`liveViewers:${room}`);
        io.to(room).emit("viewers-count", count);
      }
    });
  });

  return io;
};
