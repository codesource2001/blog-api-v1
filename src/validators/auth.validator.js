const { body, validationResult } = require("express-validator");

const validateAuth = [
  body("email").isEmail().withMessage("Please provide a valid email."),
  body("password").not().isEmpty().withMessage("Password cannot be empty."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateAuth };
