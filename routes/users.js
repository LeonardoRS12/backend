const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [decoded.email]);

    if (!rows.length || rows[0].status === "blocked") {
      return res.status(403).json({ error: "Access denied" });
    }

    req.user = rows[0];
    next();
  } catch {
    return res.status(403).json({ error: "Invalid token" });
  }
};

router.get("/", authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, email, name, last_login, status FROM users ORDER BY last_login DESC"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.post("/actions", authenticate, async (req, res) => {
  const { action, userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: "No users selected" });
  }

  try {
    if (action === "block") {
      await pool.query("UPDATE users SET status = 'blocked' WHERE id = ANY($1)", [userIds]);
      res.json({ message: "Users blocked successfully" });
    } else if (action === "unblock") {
      await pool.query("UPDATE users SET status = 'active' WHERE id = ANY($1)", [userIds]);
      res.json({ message: "Users unblocked successfully" });
    } else if (action === "delete") {
      await pool.query("DELETE FROM users WHERE id = ANY($1)", [userIds]);
      res.json({ message: "Users deleted successfully" });
    } else {
      res.status(400).json({ error: "Invalid action" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to perform action" });
  }
});

module.exports = router;