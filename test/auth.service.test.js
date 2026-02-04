const authService = require("../src/services/auth.service");
const { authRepository } = require("../src/repositories");
const { jwt } = require("../src/utils");
const bcrypt = require("bcryptjs");

// Mock dependencies
jest.mock("../src/repositories", () => ({
  authRepository: {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.mock("../src/utils", () => ({
  jwt: {
    generateToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe("Auth Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("signup", () => {
    it("should create a new user and return tokens", async () => {
      const mockData = { email: "test@example.com", password: "password123" };
      const mockUser = {
        _id: "userId",
        email: mockData.email,
        save: jest.fn(),
      };

      authRepository.findByEmail.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue("salt");
      bcrypt.hash.mockResolvedValue("hashedPassword");
      authRepository.create.mockResolvedValue(mockUser);
      jwt.generateToken.mockReturnValue("accessToken");
      jwt.generateRefreshToken.mockReturnValue("refreshToken");

      const result = await authService.signup(mockData);

      expect(authRepository.findByEmail).toHaveBeenCalledWith(mockData.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockData.password, "salt");
      expect(authRepository.create).toHaveBeenCalledWith({
        email: mockData.email,
        password: "hashedPassword",
      });
      expect(mockUser.save).toHaveBeenCalled(); // Verifies refreshToken was saved
      expect(result).toEqual({
        user: mockUser,
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      });
    });

    it("should throw error if user already exists", async () => {
      const mockData = { email: "test@example.com", password: "password123" };
      authRepository.findByEmail.mockResolvedValue({ id: "existing" });

      await expect(authService.signup(mockData)).rejects.toThrow(
        "User already exists",
      );
    });
  });

  describe("login", () => {
    it("should login user and return tokens", async () => {
      const mockData = { email: "test@example.com", password: "password123" };
      const mockUser = {
        _id: "userId",
        email: mockData.email,
        password: "hashedPassword",
        save: jest.fn(),
      };

      authRepository.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.generateToken.mockReturnValue("accessToken");
      jwt.generateRefreshToken.mockReturnValue("refreshToken");

      const result = await authService.login(mockData);

      expect(authRepository.findByEmail).toHaveBeenCalledWith(mockData.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockData.password,
        mockUser.password,
      );
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual({
        user: mockUser,
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      });
    });

    it("should throw error if user not found", async () => {
      authRepository.findByEmail.mockResolvedValue(null);
      await expect(
        authService.login({ email: "test@test.com", password: "123" }),
      ).rejects.toThrow("Invalid credentials");
    });

    it("should throw error if password does not match", async () => {
      const mockUser = { password: "hashed" };
      authRepository.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        authService.login({ email: "test@test.com", password: "123" }),
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("refreshToken", () => {
    it("should refresh tokens successfully", async () => {
      const oldToken = "oldRefreshToken";
      const decoded = { id: "userId" };
      const mockUser = {
        _id: "userId",
        email: "test@example.com",
        refreshToken: oldToken,
        save: jest.fn(),
      };

      jwt.verifyRefreshToken.mockReturnValue(decoded);
      authRepository.findById.mockResolvedValue(mockUser);
      jwt.generateToken.mockReturnValue("newAccessToken");
      jwt.generateRefreshToken.mockReturnValue("newRefreshToken");

      const result = await authService.refreshToken(oldToken);

      expect(jwt.verifyRefreshToken).toHaveBeenCalledWith(oldToken);
      expect(authRepository.findById).toHaveBeenCalledWith(decoded.id);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: "newAccessToken",
        refreshToken: "newRefreshToken",
      });
    });

    it("should throw error if user not found", async () => {
      jwt.verifyRefreshToken.mockReturnValue({ id: "userId" });
      authRepository.findById.mockResolvedValue(null);

      await expect(authService.refreshToken("token")).rejects.toThrow(
        "Invalid refresh token",
      );
    });

    it("should throw error if token does not match", async () => {
      const token = "token";
      const mockUser = { refreshToken: "differentToken" };
      jwt.verifyRefreshToken.mockReturnValue({ id: "userId" });
      authRepository.findById.mockResolvedValue(mockUser);

      await expect(authService.refreshToken(token)).rejects.toThrow(
        "Invalid refresh token",
      );
    });
  });
});
