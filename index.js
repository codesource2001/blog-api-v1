const http = require("http");
const path = require("path");
const app = require("./src/server");
const config = require("./src/config");
const connectDB = require("./src/database/db");
const { logger, socket } = require("./src/utils");
const adminRoutes = require("./src/routes/admin.routes");

const PORT = config.PORT;
const HOST = config.HOST;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));
app.use("/admin", adminRoutes);

const server = http.createServer(app);
socket.init(server); // Initialize Socket.IO BEFORE app routes are used

server.listen(PORT, HOST, async () => {
  try {
    const baseUrl =
      HOST === "0.0.0.0"
        ? `http://localhost:${PORT}`
        : `http://${HOST}:${PORT}`;

    // Log startup message
    logger.info(`Server is running on ${baseUrl}`);
    logger.info(`Admin dashboard available at ${baseUrl}/admin/login`);
    logger.debug("Node environment: " + config.NODE_ENV);

    await connectDB();
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Failed to start the server: %s", error.message);
    process.exit(1);
  }
});
