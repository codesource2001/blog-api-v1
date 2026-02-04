const jwt = require("jsonwebtoken");
const config = require("../config");

/**
 * Generates a JSON Web Token.
 * @param {object} payload - The payload to sign.
 * @returns {string} The generated JWT.
 */
const generateToken = (payload) => {
  if (!config.JWT_SECRET) {
    const error = new Error(
      "JWT_SECRET is not defined in environment variables.",
    );
    error.statusCode = 500;
    throw error;
  }
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

const generateRefreshToken = (payload) => {
  if (!config.REFRESH_TOKEN_SECRET) {
    const error = new Error(
      "REFRESH_TOKEN_SECRET is not defined in environment variables.",
    );
    error.statusCode = 500;
    throw error;
  }

  return jwt.sign(payload, config.REFRESH_TOKEN_SECRET, {
    expiresIn: config.REFRESH_TOKEN_EXPIRES_IN,
  });
};

/**
 * Verifies a JSON Web Token.
 * @param {string} token - The JWT to verify.
 * @returns {object | string} The decoded payload.
 */
const verifyToken = (token) => {
  if (!config.JWT_SECRET) {
    const error = new Error(
      "JWT_SECRET is not defined in environment variables.",
    );
    error.statusCode = 500;
    throw error;
  }
  return jwt.verify(token, config.JWT_SECRET);
};

const verifyRefreshToken = (token) => {
  if (!config.REFRESH_TOKEN_SECRET) {
    const error = new Error(
      "REFRESH_TOKEN_SECRET is not defined in environment variables.",
    );
    error.statusCode = 500;
    throw error;
  }

  return jwt.verify(token, config.REFRESH_TOKEN_SECRET);
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
};
