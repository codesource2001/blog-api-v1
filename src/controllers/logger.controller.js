const fs = require("fs");
const path = require("path");
const { catchAsync } = require("../utils");

const getLogs = catchAsync(async (req, res) => {
  const { type } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;

  // Basic validation to prevent directory traversal or accessing other files
  if (type !== "error" && type !== "combined") {
    return res.status(400).json({
      success: false,
      message: "Invalid log type. Use 'error' or 'combined'.",
    });
  }

  const filePath = path.join(process.cwd(), `${type}.log`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: "Log file not found.",
    });
  }

  const fileContent = await fs.promises.readFile(filePath, "utf8");
  const lines = fileContent.trim().split("\n");
  const totalLines = lines.length === 1 && lines[0] === "" ? 0 : lines.length;
  const totalPages = Math.ceil(totalLines / limit);

  // Calculate indices to slice from the end (newest logs)
  const endIndex = Math.max(totalLines - (page - 1) * limit, 0);
  const startIndex = Math.max(totalLines - page * limit, 0);

  const paginatedLines =
    totalLines > 0 && startIndex < endIndex
      ? lines.slice(startIndex, endIndex).reverse()
      : [];

  res.json({
    success: true,
    data: paginatedLines.join("\n"),
    pagination: {
      currentPage: page,
      totalPages,
      totalLogs: totalLines,
      limit,
    },
  });
});

const getDashboard = (req, res) => {
  // The `protect` middleware attaches the user object to the request
  res.render("dashboard", { user: req.user });
};

module.exports = { getLogs, getDashboard };
