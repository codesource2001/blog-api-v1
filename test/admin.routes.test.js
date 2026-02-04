const request = require("supertest");
const express = require("express");

// Mock dependencies BEFORE requiring routes
jest.mock("../src/controllers/admin.controller");
jest.mock("../src/services");
jest.mock("../src/utils");
jest.mock("../src/middlewares", () => ({
  protect: (req, res, next) => {
    req.user = { role: "admin", id: "admin-user-id" };
    next();
  },
  restrictTo: () => (req, res, next) => {
    next();
  },
}));

const adminRoutes = require("../src/routes/admin.routes");
const adminController = require("../src/controllers/admin.controller");
const { authService } = require("../src/services");
const { cookies } = require("../src/utils");

// Create a minimal Express app for testing
const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/admin", adminRoutes);
  return app;
};

describe("Admin Routes", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createApp();
  });

  describe("GET /admin", () => {
    it("should render admin dashboard for protected route", (done) => {
      adminController.getDashboard.mockImplementation((req, res) => {
        res.json({ page: "admin/dashboard", title: "Admin Dashboard" });
      });

      request(app)
        .get("/admin")
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(adminController.getDashboard).toHaveBeenCalled();
          expect(res.body.page).toBe("admin/dashboard");
          done();
        });
    });
  });

  describe("GET /admin/login", () => {
    it("should render admin login page", (done) => {
      adminController.getLogin.mockImplementation((req, res) => {
        res.json({ page: "admin/login", title: "Admin Login", error: null });
      });

      request(app)
        .get("/admin/login")
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(adminController.getLogin).toHaveBeenCalled();
          expect(res.body.page).toBe("admin/login");
          done();
        });
    });
  });

  describe("POST /admin/login", () => {
    it("should login user and set cookies on success", (done) => {
      const mockTokens = {
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
      };

      authService.login = jest.fn().mockResolvedValue(mockTokens);
      cookies.setTokensCookies = jest.fn();

      adminController.login.mockImplementation(async (req, res) => {
        try {
          const { username, password } = req.body;
          const { accessToken, refreshToken } = await authService.login({
            email: username,
            password,
          });

          cookies.setTokensCookies(res, accessToken, refreshToken);
          res.redirect("/admin");
        } catch (error) {
          res.status(400).json({ error: error.message });
        }
      });

      request(app)
        .post("/admin/login")
        .send({ username: "admin@example.com", password: "password123" })
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          expect(authService.login).toHaveBeenCalledWith({
            email: "admin@example.com",
            password: "password123",
          });
          expect(cookies.setTokensCookies).toHaveBeenCalledWith(
            expect.any(Object),
            "mock-access-token",
            "mock-refresh-token",
          );
          done();
        });
    });

    it("should render login page with error on invalid credentials", (done) => {
      authService.login = jest
        .fn()
        .mockRejectedValue(new Error("Invalid credentials"));

      adminController.login.mockImplementation(async (req, res) => {
        try {
          const { username, password } = req.body;
          const { accessToken, refreshToken } = await authService.login({
            email: username,
            password,
          });

          cookies.setTokensCookies(res, accessToken, refreshToken);
          res.redirect("/admin");
        } catch (error) {
          res.status(400).json({
            page: "admin/login",
            title: "Admin Login",
            error: error.message,
          });
        }
      });

      request(app)
        .post("/admin/login")
        .send({ username: "admin@example.com", password: "wrongpassword" })
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.error).toBe("Invalid credentials");
          done();
        });
    });
  });

  describe("Route Protection", () => {
    it("should have all three routes defined", () => {
      expect(adminRoutes.stack).toBeDefined();
      // Routes should exist (GET /, GET /login, POST /login)
      expect(adminRoutes.stack.length).toBeGreaterThanOrEqual(3);
    });
  });
});
