const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("./jwt");
const { authRepository } = require("../repositories");

let io;

const init = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // Allow all origins for development. Restrict this in production.
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  console.log("🔌 Socket.IO initialized and attached to HTTP server");

  // Socket.IO authentication middleware
  io.use(async (socket, next) => {
    try {
      const cookieStr = socket.handshake.headers.cookie || "";
      const cookies = cookie.parse(cookieStr);
      const token = cookies.accessToken;

      if (!token) {
        return next(new Error("Authentication error: No token provided."));
      }

      const decoded = jwt.verifyToken(token);
      const user = await authRepository.findById(decoded.id);

      if (!user || user.role !== "admin") {
        return next(new Error("Authorization error: Not an admin."));
      }

      socket.user = user;
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token."));
    }
  });

  io.on("connection", (socket) => {
    // Using console.log here to avoid a circular dependency with the Winston logger
    console.log(`Admin ${socket.user.email} connected to live logs`);
    socket.join("admin-logs");

    socket.on("disconnect", () => {
      console.log(`Admin ${socket.user.email} disconnected from live logs`);
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

module.exports = { init, getIO };
