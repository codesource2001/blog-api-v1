const { authService } = require("../services");
const { cookies } = require("../utils");

const getDashboard = (req, res) => {
  res.render("admin/dashboard", { title: "Admin Dashboard" });
};

const getLogin = (req, res) => {
  res.render("admin/login", { title: "Admin Login", error: null });
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).render("admin/login", {
        title: "Admin Login",
        error: "Email and password are required",
      });
    }

    const { accessToken, refreshToken } = await authService.login({
      email: username,
      password,
    });

    cookies.setTokensCookies(res, accessToken, refreshToken);

    res.redirect("/admin");
  } catch (error) {
    res.render("admin/login", { title: "Admin Login", error: error.message });
  }
};

module.exports = {
  getDashboard,
  getLogin,
  login,
};
