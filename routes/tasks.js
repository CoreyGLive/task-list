import express from "express";
import db from "#db/client";
import requireUser from "#middleware/requireUser";

const router = express.Router();

// Create a new task (protected)
router.post("/", requireUser, async (req, res) => {
  const { title, done } = req.body;
  if (typeof title !== "string" || typeof done !== "boolean") {
    return res.status(400).send("Title and done are required.");
  }
  const userId = req.user.id;
  const result = await db.query(
    "INSERT INTO tasks (user_id, title, done) VALUES ($1, $2, $3) RETURNING *",
    [userId, title, done]
  );
  res.status(201).json(result.rows[0]);
});

// Get all tasks for the logged-in user (protected)
router.get("/", requireUser, async (req, res) => {
  const userId = req.user.id;
  const result = await db.query(
    "SELECT * FROM tasks WHERE user_id = $1 ORDER BY id",
    [userId]
  );
  res.json(result.rows);
});

// Update a task (protected)
router.put("/:id", requireUser, async (req, res) => {
  const { title, done } = req.body;
  if (typeof title !== "string" || typeof done !== "boolean") {
    return res.status(400).send("Title and done are required.");
  }
  const userId = req.user.id;
  const { id } = req.params;
  // Check ownership
  const taskRes = await db.query("SELECT * FROM tasks WHERE id = $1", [id]);
  const task = taskRes.rows[0];
  if (!task || task.user_id !== userId) {
    return res.status(403).send("Forbidden");
  }
  const result = await db.query(
    "UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *",
    [title, done, id]
  );
  res.json(result.rows[0]);
});

// Delete a task (protected)
router.delete("/:id", requireUser, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  // Check ownership
  const taskRes = await db.query("SELECT * FROM tasks WHERE id = $1", [id]);
  const task = taskRes.rows[0];
  if (!task || task.user_id !== userId) {
    return res.status(403).send("Forbidden");
  }
  await db.query("DELETE FROM tasks WHERE id = $1", [id]);
  res.sendStatus(204);
});

export default router;
