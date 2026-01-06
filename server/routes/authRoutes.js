import express from "express";
import { registerUser, loginUser, forgotPassword, changePassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/change-password", protect, changePassword);

export default router;
