const { jwt, catchAsync } = require("../utils");
const { authRepository } = require("../repositories");

const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Get token from header or cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    const error = new Error("Not authorized, no token provided.");
    error.statusCode = 401;
    throw error;
  }

  // 2. Verify token
  const decoded = jwt.verifyToken(token);

  // 3. Check if user still exists
  const currentUser = await authRepository.findById(decoded.id);
  if (!currentUser) {
    const error = new Error(
      "The user belonging to this token no longer exists.",
    );
    error.statusCode = 401;
    throw error;
  }

  // 4. Grant access
  req.user = currentUser;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const error = new Error(
        "You do not have permission to perform this action",
      );
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
};

module.exports = { protect, restrictTo };
