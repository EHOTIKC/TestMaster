import express from "express";
import TestTopic from "../models/TestTopic.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
// import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = express.Router();

// Перегляд всіх тем тестів — доступно студентам і вище
router.get("/", protect, authorizeRoles("student"), async (req, res) => {
  try {
    const topics = await TestTopic.find();
    res.json(topics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
