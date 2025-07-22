import express from "express";
import bcrypt from "bcrypt";
import { createToken } from "#utils/jwt";
import db from "#db/client";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).send("Username and password required.");

  const hash = await bcrypt.hash(password, 10);
  try {
    const result = await db.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username",
      [username, hash]
    );
    const user = result.rows[0];
    const token = createToken({ id: user.id });
    res.json({ token });
  } catch (e) {
    res.status(400).send("Username already exists.");
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).send("Username and password required.");

  const result = await db.query(
    "SELECT * FROM users WHERE username = $1",
    [username]
  );
  const user = result.rows[0];
  if (!user) return res.status(400).send("Invalid credentials.");

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(400).send("Invalid credentials.");

  const token = createToken({ id: user.id });
  res.json({ token });
});

export default router;
