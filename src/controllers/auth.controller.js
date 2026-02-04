const { authService } = require("../services");
const { catchAsync, cookies } = require("../utils");

const signup = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // The service should now create the user and generate a token
  const { user, accessToken, refreshToken } = await authService.signup({
    email,
    password,
  });

  cookies.setTokensCookies(res, accessToken, refreshToken);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
      },
    },
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // The service should validate credentials and generate a token
  const { user, accessToken, refreshToken } = await authService.login({
    email,
    password,
  });

  cookies.setTokensCookies(res, accessToken, refreshToken);

  // Redirect admins to the dashboard, return JSON for other users
  if (user.role === "admin") {
    return res.redirect("/logs/dashboard");
  } else {
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
        },
      },
    });
  }
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    const error = new Error("Refresh token not found");
    error.statusCode = 401;
    throw error;
  }

  const tokens = await authService.refreshToken(refreshToken);

  cookies.setTokensCookies(res, tokens.accessToken, tokens.refreshToken);

  res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    data: tokens,
  });
});

const logout = catchAsync(async (req, res) => {
  cookies.clearCookie(res);
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

module.exports = {
  signup,
  login,
  refreshToken,
  logout,
};
