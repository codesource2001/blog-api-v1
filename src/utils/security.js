/**
 * Security Utilities
 * Includes password policy validation and input sanitization
 */

const config = require("../config");

/**
 * Password Policy Validation
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (!@#$%^&*)
 */
const passwordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: "!@#$%^&*",
};

/**
 * Validate password against policy
 * @param {string} password - Password to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
const validatePassword = (password) => {
  const errors = [];

  if (!password || typeof password !== "string") {
    errors.push("Password must be a string");
    return { valid: false, errors };
  }

  if (password.length < passwordPolicy.minLength) {
    errors.push(
      `Password must be at least ${passwordPolicy.minLength} characters`,
    );
  }

  if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (passwordPolicy.requireNumbers && !/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (passwordPolicy.requireSpecialChars) {
    const specialCharsRegex = new RegExp(
      `[${passwordPolicy.specialChars.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}]`,
    );
    if (!specialCharsRegex.test(password)) {
      errors.push(
        `Password must contain at least one special character: ${passwordPolicy.specialChars}`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize string input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
const sanitizeString = (input) => {
  if (typeof input !== "string") {
    return input;
  }

  // Remove HTML tags and dangerous characters
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/[&]/g, "&amp;") // Escape ampersands
    .trim();
};

/**
 * Sanitize object recursively
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
const sanitizeObject = (obj) => {
  if (typeof obj !== "object" || obj === null) {
    return typeof obj === "string" ? sanitizeString(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }
  return sanitized;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if string contains SQL injection attempts
 * @param {string} input - Input to check
 * @returns {boolean} True if potential SQL injection detected
 */
const hasSQLInjectionPatterns = (input) => {
  if (typeof input !== "string") return false;

  const sqlPatterns = [
    /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|SCRIPT|JAVASCRIPT|ONERROR)\b)/i,
    /(--|;|\/\*|\*\/|xp_|sp_)/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
};

/**
 * Rate limit key generator for IP-based throttling
 * @param {Object} req - Express request object
 * @returns {string} IP address for rate limiting
 */
const getRateLimitKey = (req) => {
  return req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
};

module.exports = {
  passwordPolicy,
  validatePassword,
  sanitizeString,
  sanitizeObject,
  validateEmail,
  hasSQLInjectionPatterns,
  getRateLimitKey,
};
