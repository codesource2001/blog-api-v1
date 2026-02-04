const { catchAsync } = require("../utils");

const getMe = catchAsync(async (req, res) => {
  // req.user is attached by the 'protect' middleware
  const user = req.user;

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
    },
  });
});

module.exports = {
  getMe,
};
