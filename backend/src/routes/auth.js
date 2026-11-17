const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { body } = require("express-validator");
const pool = require("../db");
const { validateRequest } = require("../middleware/errors");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again later." }
});

router.post(
  "/login",
  loginLimiter,
  body("username").isString().trim().notEmpty(),
  body("password").isString().notEmpty(),
  validateRequest,
  async (req, res) => {
    const { username, password } = req.body;
    const result = await pool.query(
      "SELECT id, username, password_hash FROM admins WHERE username = $1",
      [username]
    );

    const admin = result.rows[0];
    const passwordMatches = admin
      ? await bcrypt.compare(password, admin.password_hash)
      : false;

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      token,
      admin: { id: admin.id, username: admin.username }
    });
  }
);

module.exports = router;
