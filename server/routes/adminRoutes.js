import express from "express";
import {
  getUsers,
  getTests,
  deleteUsers,
  deleteTests,
  getAdminLogs
} from "../controllers/adminController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { adminLogger } from "../middleware/adminLogger.js";

const router = express.Router();

router.get("/users", protect, authorizeRoles("admin"), getUsers);
router.get("/tests", protect, authorizeRoles("admin"), getTests);
router.get("/logs", protect, authorizeRoles("admin"), getAdminLogs);

router.delete(
  "/users",
  protect,
  authorizeRoles("admin"),
  adminLogger(async (req) => {
    if (req.deletedUsers?.length) {
      return `Адмін ${req.user.username} видалив користувачів: ${req.deletedUsers.join(", ")}`;
    }
    return `Адмін ${req.user.username} виконав видалення користувачів (імена не знайдено)`;
  }),
  deleteUsers
);

router.delete(
  "/tests",
  protect,
  authorizeRoles("admin"),
  adminLogger(async (req) => {
    if (req.deletedTests?.length) {
      return `Адмін ${req.user.username} видалив тести: ${req.deletedTests.join(", ")}`;
    }
    return `Адмін ${req.user.username} виконав видалення тестів (назви не знайдено)`;
  }),
  deleteTests
);

export default router;
