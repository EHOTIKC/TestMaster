import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/db.js";


import { initQuestionTypes } from "./initQuestionTypes.js";
import { initTestTopics } from "./initTestTopics.js";

import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import questionTypeRoutes from "./routes/questionTypeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import testTopicRoutes from "./routes/testTopicRoutes.js";
import testResultRoutes from "./routes/testResultRoutes.js";

import userRoutes from "./routes/userRoutes.js";




dotenv.config();
connectDB();

mongoose.connection.once("open", async () => {
  console.log("Підключено до MongoDB");
  await initQuestionTypes();
  await initTestTopics();
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.use("/api/auth", authRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/test-topics", testTopicRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/question-types", questionTypeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/test-results", testResultRoutes);
app.use("/api/users", userRoutes);
app.get("/", (req, res) => {
  res.json({ message: "Сервер працює." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
