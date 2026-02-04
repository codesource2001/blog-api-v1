const app = require("./src/server");
const config = require("./src/config");
const connectDB = require("./src/database/db");
if (config.NODE_ENV === "development") {
  require("dotenv").config();
}

const PORT = config.PORT;
const HOST = config.HOST;

app.listen(PORT, HOST, async () => {
  try {
    const baseUrl =
      HOST === "0.0.0.0"
        ? `http://localhost:${PORT}`
        : `http://${HOST}:${PORT}`;
    console.log(`Server is running on ${baseUrl}`);
    await connectDB();
  } catch (error) {
    console.error("Failed to start the server:", error.message);
  }
});
