const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const pool = require("./config/db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await pool.connect();
    console.log(`Connected to the database`);
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
});