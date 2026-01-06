import express from "express";
import QuestionType from "../models/QuestionType.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
// import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = express.Router();

// Отримати всі типи питань (для авторизованих користувачів, рівень >= student)
router.get("/", protect, authorizeRoles("student"), async (req, res) => {
  try {
    const types = await QuestionType.find();
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Створити новий тип питання (для викладача або адміна)
router.post("/", protect, authorizeRoles("teacher"), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Поле name обов'язкове" });

    const newType = new QuestionType({ name, description });
    const savedType = await newType.save();
    res.status(201).json(savedType);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
