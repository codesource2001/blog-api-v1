const config = require("../config");

const setTokensCookies = (res, accessToken, refreshToken) => {
  const accessTokenExpiresIn = parseInt(config.JWT_EXPIRES_IN) || 1; // hours
  const refreshTokenExpiresIn = parseInt(config.REFRESH_TOKEN_EXPIRES_IN) || 7; // days

  const accessTokenOptions = {
    expires: new Date(Date.now() + accessTokenExpiresIn * 60 * 60 * 1000),
    httpOnly: true,
    secure: config.NODE_ENV === "production",
  };

  const refreshTokenOptions = {
    expires: new Date(
      Date.now() + refreshTokenExpiresIn * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    secure: config.NODE_ENV === "production",
  };

  res.cookie("accessToken", accessToken, accessTokenOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenOptions);
};

const clearCookie = (res) => {
  res.cookie("accessToken", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: config.NODE_ENV === "production",
  });
  res.cookie("refreshToken", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: config.NODE_ENV === "production",
  });
};

module.exports = { setTokensCookies, clearCookie };
