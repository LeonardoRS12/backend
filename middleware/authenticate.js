const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized access. Token required." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [decoded.email]);
    if (!rows.length) {
      return res.status(404).json({ error: "User not found. Please log in again." });
    }

    const user = rows[0];

    if (user.status === "blocked") {
      return res.status(403).json({ error: "Your account is blocked. Contact admin." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token. Please log in again." });
  }
};

module.exports = authenticate;