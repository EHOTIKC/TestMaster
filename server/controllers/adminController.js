import User from "../models/User.js";
import Test from "../models/Test.js";
import TestResult from "../models/TestResult.js";
import mongoose from "mongoose";
import AdminLog from "../models/AdminLog.js";


import { Question, SingleChoiceQuestion, MultipleChoiceQuestion, MatchingQuestion } from "../models/Question.js";


const questionModels = {
  SingleChoiceQuestion: mongoose.model("SingleChoiceQuestion"),
  MultipleChoiceQuestion: mongoose.model("MultipleChoiceQuestion"),
  MatchingQuestion: mongoose.model("MatchingQuestion"),
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "_id username email role");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка при отриманні користувачів" });
  }
};


export const deleteUsers = async (req, res) => {
  const { ids } = req.body;
  try {
    const users = await User.find({ _id: { $in: ids } }).select("username");
    req.deletedUsers = users.map((u) => u.username);

    await TestResult.deleteMany({ user: { $in: ids } });

    await User.deleteMany({ _id: { $in: ids } });

    res.json({ message: "Користувачі та їх результати тестів видалені" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка при видаленні користувачів" });
  }
};


export const getTests = async (req, res) => {
  try {
    const tests = await Test.find({})
      .populate("topic", "name")
      .select("_id title topic createdAt");

    res.json(tests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка при отриманні тестів" });
  }
};



export const deleteTests = async (req, res) => {
  const { ids } = req.body;
  try {
    const tests = await Test.find({ _id: { $in: ids } });

    req.deletedTests = tests.map((t) => t.title);

    for (const test of tests) {
      await Question.deleteMany({
        _id: { $in: test.questions.map(q => q.questionId) }
      });
    }


    await TestResult.deleteMany({ test: { $in: ids } });

    await Test.deleteMany({ _id: { $in: ids } });

    res.json({ message: "Тести, їхні питання та результати видалені" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка при видаленні тестів" });
  }
};


export const getAdminLogs = async (req, res) => {
  try {
    const logs = await AdminLog.find()
      .populate("admin", "username email")
      .sort({ date: -1 })
      .limit(50);

    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка при отриманні логів адміністратора" });
  }
};