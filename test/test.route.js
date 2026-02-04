const { Router } = require("express");
const testRouter = Router();

testRouter.get("/", (req, res) => {
  res.status(200).json({ sucess: true, message: "Server Alive!" });
});

module.exports = testRouter;
