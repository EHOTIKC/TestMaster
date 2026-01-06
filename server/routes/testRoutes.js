import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
// import { authorizeRoles } from "../middleware/authorizeRoles.js";
import {
  getAllTests,
  getTestByTestId,
  getTestById,
  createTest,
  getMyTests,
  getTestResults,
  deleteMyTest,
  checkIfAttempted,
  updateMyTest,
} from "../controllers/testController.js";

const router = express.Router();

// Отримати всі тести (доступно всім)
router.get("/", getAllTests);

// Отримати тест за testId (публічно)
router.get("/by-id/:testId", getTestByTestId);

// Отримати тести викладача або адміна
router.get("/my", protect, authorizeRoles("teacher"), getMyTests);

// Переглянути результати тестів (для викладача або адміна)
router.get("/:id/results", protect, authorizeRoles("teacher"), getTestResults);

// Перевірити, чи користувач уже проходив тест
router.get("/:id/checkAttempt", protect, checkIfAttempted);

// Отримати тест за ID (для авторизованих користувачів)
router.get("/:id", protect, getTestById);

// Створити новий тест (для викладача або адміна)
router.post("/", protect, authorizeRoles("teacher"), createTest);

// Оновити свій тест (для викладача або адміна)
router.put("/:id", protect, authorizeRoles("teacher"), updateMyTest);

// Видалити свій тест (для викладача, адміна або власника тесту)
router.delete("/:id", protect, deleteMyTest);

export default router;
