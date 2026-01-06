import express from "express";
import { saveTestResult, getUserResults, getDetailedResult } from "../controllers/testResultController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Зберегти результат тесту (для студентів і вище)
router.post("/:testId", protect, authorizeRoles("student"), saveTestResult);

// Перегляд власних результатів (для студентів і вище)
router.get("/my-results", protect, authorizeRoles("student"), getUserResults);

// Детальний результат по конкретному id (для студентів і вище)
router.get("/:resultId", protect, authorizeRoles("student"), getDetailedResult);

export default router;
