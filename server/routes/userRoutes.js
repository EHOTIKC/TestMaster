import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// Отримати профіль поточного користувача
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }
    res.json(user);
  } catch (err) {
    console.error("Помилка при отриманні профілю:", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

export default router;
