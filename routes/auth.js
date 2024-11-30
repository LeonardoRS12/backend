const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Register Endpoint
router.post("/register", async (req, res) => {
  console.log("Request body received:", req.body);

  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "All fields (email, password, name) are required" });
  }

  try {
    // Check if the user already exists
    const { rows: existingUsers } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user
    await pool.query(
      "INSERT INTO users (email, password, name, status) VALUES ($1, $2, $3, $4)",
      [email, hashedPassword, name, "active"]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login Endpoint
router.post("/login", async (req, res) => {
  console.log("Login endpoint hit");

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Check if the user exists
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = rows[0];

    // Check if the user is blocked
    if (user.status === "blocked") {
      return res.status(403).json({ error: "Your account is blocked" });
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: "1h" });

    // Update last login time
    await pool.query("UPDATE users SET last_login = NOW() WHERE email = $1", [email]);

    res.json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;