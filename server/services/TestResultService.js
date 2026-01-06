import mongoose from "mongoose";
import TestResult from "../models/TestResult.js";
import Test from "../models/Test.js";

export default class TestResultService {

  async saveResult(testId, userId, answers) {
    const test = await Test.findById(testId);
    if (!test) throw { status: 404, message: "Тест не знайдено" };

    if (test.singleAttempt) {
      const existingResult = await TestResult.findOne({ test: testId, user: userId });
      if (existingResult) {
        return {
          error: true,
          status: 403,
          message: "Цей тест можна пройти лише один раз",
          previousScore: existingResult.score,
          previousDate: existingResult.date
        };
      }
    }

    const populatedQuestions = await Promise.all(
      test.questions.map(async (q) => {
        const Model = mongoose.model(q.model);
        return await Model.findById(q.questionId).populate("type");
      })
    );

    let totalScore = 0;
    let maxScore = 0;

    for (let q of populatedQuestions) {
      const userAnswer = answers[q._id];
      const qScoreValue = q.score || 1;
      maxScore += qScoreValue;

      if (!userAnswer) continue;

      const qType = q.type?.model || q.model;
      let qScore = 0;

      if (qType === "SingleChoiceQuestion") {
        if (userAnswer === q.correctAnswer?.text) qScore = qScoreValue;

      } else if (qType === "MultipleChoiceQuestion") {
        const correct = q.correctAnswers?.map(a => a.text) || [];
        const per = qScoreValue / correct.length;

        userAnswer.forEach(ans => {
          if (correct.includes(ans)) qScore += per;
          else qScore -= per * 0.5;
        });

        qScore = Math.min(Math.max(qScore, 0), qScoreValue);

      } else if (qType === "MatchingQuestion") {
        const pairs = q.correctAnswers || [];
        const per = qScoreValue / pairs.length;

        pairs.forEach(pair => {
          if (userAnswer[pair.text] === pair.matchingKey) qScore += per;
        });

        qScore = Math.min(qScore, qScoreValue);
      }

      totalScore += qScore;
    }

    const scorePercent = parseFloat(((totalScore / maxScore) * 100).toFixed(2));

    const newResult = new TestResult({
      test: testId,
      user: userId,
      answers,
      score: scorePercent,
      date: new Date(),
    });

    await newResult.save();

    return {
      score: scorePercent,
      showCorrectAnswers: test.showCorrectAnswers
    };
  }

  async getUserResults(userId) {
    return await TestResult.find({ user: userId })
      .populate("test", "title description showCorrectAnswers")
      .sort({ date: -1 });
  }

  async getDetailedResult(resultId, userId) {
    const result = await TestResult.findOne({ _id: resultId, user: userId })
      .populate({
        path: "test",
        populate: { path: "questions.questionId" }
      });

    if (!result) throw { status: 404, message: "Результат не знайдено" };

    const questions = await Promise.all(
      result.test.questions.map(async (q) => {
        const Model = mongoose.model(q.model);
        const question = await Model.findById(q.questionId);
        const userAnswer = result.answers[question._id] || null;

        return {
          _id: question._id,
          text: question.text,
          userAnswer,
          correctAnswer: question.correctAnswer || question.correctAnswers || null
        };
      })
    );

    return {
      test: {
        title: result.test.title,
        showCorrectAnswers: result.test.showCorrectAnswers
      },
      score: result.score,
      questions
    };
  }
}
