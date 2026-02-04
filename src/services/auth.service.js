const bcrypt = require("bcryptjs");
const { authRepository } = require("../repositories");
const { jwt } = require("../utils");

const signup = async (data) => {
  const { email, password } = data;

  const existingUser = await authRepository.findByEmail(email);
  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let user = await authRepository.create({ email, password: hashedPassword });

  const accessToken = jwt.generateToken({ id: user._id, email: user.email });
  const refreshToken = jwt.generateRefreshToken({
    id: user._id,
    email: user.email,
  });

  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
};

const login = async (data) => {
  const { email, password } = data;

  const user = await authRepository.findByEmail(email);
  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const accessToken = jwt.generateToken({ id: user._id, email: user.email });
  const refreshToken = jwt.generateRefreshToken({
    id: user._id,
    email: user.email,
  });

  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
};

const refreshToken = async (token) => {
  const decoded = jwt.verifyRefreshToken(token);
  const user = await authRepository.findById(decoded.id);

  if (!user || user.refreshToken !== token) {
    const error = new Error("Invalid refresh token");
    error.statusCode = 403;
    throw error;
  }

  const newAccessToken = jwt.generateToken({ id: user._id, email: user.email });
  const newRefreshToken = jwt.generateRefreshToken({
    id: user._id,
    email: user.email,
  });

  user.refreshToken = newRefreshToken;
  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

module.exports = {
  signup,
  login,
  refreshToken,
};
