import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
// import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { getAllQuestions, getQuestionById, createQuestion } from "../controllers/questionController.js";

const router = express.Router();

// Всі питання — доступ студентам і вище
router.get("/", protect, authorizeRoles("student"), getAllQuestions);

// Конкретне питання — доступ студентам і вище
router.get("/:model/:id", protect, authorizeRoles("student"), getQuestionById);

// Створення питання — доступ тільки викладачу та адміну
router.post("/", protect, authorizeRoles("teacher"), createQuestion);

export default router;
