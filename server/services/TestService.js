import mongoose from "mongoose";
import Test from "../models/Test.js";
import TestEntity from "../models/entities/TestEntity.js";

import TestTopic from "../models/TestTopic.js";
import TestResult from "../models/TestResult.js";
import QuestionType from "../models/QuestionType.js";
import {
  SingleChoiceQuestion,
  MultipleChoiceQuestion,
  MatchingQuestion
} from "../models/Question.js";

export default class TestService {
  modelMap = {
    SingleChoiceQuestion,
    MultipleChoiceQuestion,
    MatchingQuestion,
  };

  async getAllTests() {
    const tests = await Test.find().populate("topic");

    const result = [];
    for (const test of tests) {
      const populated = [];
      for (const q of test.questions) {
        const Model = this.modelMap[q.model];
        const question = await Model.findById(q.questionId).populate("type");
        populated.push(question);
      }

      result.push({
        ...test.toObject(),
        questions: populated
      });
    }
    return result;
  }

  async getTestById(testId) {
    const test = await Test.findById(testId).populate("topic");
    if (!test) return null;

    const populated = [];
    for (const q of test.questions) {
      const Model = this.modelMap[q.model];
      populated.push(await Model.findById(q.questionId).populate("type"));
    }

    return {
      ...test.toObject(),
      questions: populated
    };
  }

  async getTestByTestId(testId) {
    return await Test.findOne({ testId }).populate("topic");
  }

  async getUserTests(userId) {
    return await Test.find({ creator: userId }).populate("topic");
  }

  validateQuestionData(q) {
    if (q.model === "SingleChoiceQuestion") {
      const optionTexts = q.options.map(o => o.text);
      if (!optionTexts.includes(q.correctAnswer))
        throw new Error(`Правильна відповідь ${q.correctAnswer} відсутня`);
    }

    if (q.model === "MultipleChoiceQuestion") {
      const optionTexts = q.options.map(o => o.text);
      const missing = q.correctAnswers.filter(a => !optionTexts.includes(a.text));
      if (missing.length > 0)
        throw new Error(`Некоректні правильні відповіді: ${missing.map(a => a.text).join(", ")}`);
    }

    if (q.model === "MatchingQuestion") {
      const optionKeys = q.options.map(o => o.matchingKey);
      const correctKeys = q.correctAnswers.map(a => a.matchingKey);

      if (new Set(optionKeys).size !== optionKeys.length)
        throw new Error("matchingKey мають бути унікальними");

      const missingKeys = correctKeys.filter(k => !optionKeys.includes(k));
      if (missingKeys.length > 0)
        throw new Error(`Некоректні ключі: ${missingKeys.join(", ")}`);
    }
  }

  async createTest(data, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        title,
        description,
        topic,
        questions,
        singleAttempt = false,
        showCorrectAnswers = false
      } = data;

      if (!title || !questions?.length)
        throw new Error("Назва і питання обов'язкові");

      let topicDoc = null;
      if (topic) {
        topicDoc = await TestTopic.findById(topic).session(session);
        if (!topicDoc) throw new Error("Тема не знайдена");
      }

      const questionRefs = [];

      for (const q of questions) {
        this.validateQuestionData(q);

        const Model = this.modelMap[q.model];
        const typeDoc = await QuestionType.findOne({ model: q.model }).session(session);

        const created = await new Model({
          text: q.text,
          type: typeDoc._id,
          options: q.options,
          correctAnswer: q.correctAnswer ? { text: q.correctAnswer } : undefined,
          correctAnswers: q.correctAnswers,
          score: q.score || 1
        }).save({ session });

        questionRefs.push({
          questionId: created._id,
          model: q.model
        });
      }

      const entity = new TestEntity({
        title,
        description,
        topic: topicDoc?._id ?? null,
        questions: questionRefs,
        creator: userId,
        singleAttempt,
        showCorrectAnswers
      });

      const savedTest = await new Test(entity).save({ session });

      await session.commitTransaction();
      session.endSession();

      return savedTest;
    } catch (e) {
      await session.abortTransaction();
      session.endSession();
      throw e;
    }
  }

  async deleteUserTest(testId, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const test = await Test.findById(testId).session(session);
      if (!test) throw new Error("Тест не знайдено");
      if (test.creator.toString() !== userId)
        throw new Error("Немає прав видаляти");

      for (const q of test.questions) {
        const Model = this.modelMap[q.model];
        await Model.deleteOne({ _id: q.questionId }).session(session);
      }

      await TestResult.deleteMany({ test: testId }).session(session);
      await Test.findByIdAndDelete(testId).session(session);

      await session.commitTransaction();
      session.endSession();

      return true;
    } catch (e) {
      await session.abortTransaction();
      session.endSession();
      throw e;
    }
  }

  async checkAttempt(testId, userId) {
    const test = await Test.findById(testId);
    if (!test) throw new Error("Тест не знайдено");

    const attempt = await TestResult.findOne({
      test: testId,
      user: userId
    });

    return {
      attempted: !!attempt,
      singleAttempt: test.singleAttempt
    };
  }





  async updateTest(testId, userId, data) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const test = await Test.findById(testId).session(session);
    if (!test) throw new Error("Тест не знайдено");
    if (test.creator.toString() !== userId)
      throw new Error("Ви не маєте права оновлювати цей тест");

    const { title, description, topic, questions, singleAttempt, showCorrectAnswers } = data;

    let topicDoc = null;
    if (topic) {
      topicDoc = await TestTopic.findById(topic).session(session);
      if (!topicDoc) throw new Error("Вказано неіснуючу тему тесту");
    }

    for (const q of test.questions) {
      const Model = this.modelMap[q.model];
      if (Model) await Model.deleteOne({ _id: q.questionId }).session(session);
    }

    await TestResult.deleteMany({ test: testId }).session(session);

    const savedQuestions = [];
    for (const q of questions) {
      this.validateQuestionData(q);

      const Model = this.modelMap[q.model];
      const typeDoc = await QuestionType.findOne({ model: q.model }).session(session);
      if (!typeDoc) throw new Error(`Тип питання '${q.model}' не знайдено в базі`);

      const newQuestion = new Model({
        text: q.text,
        type: typeDoc._id,
        options: q.options || [],
        correctAnswer: q.correctAnswer ? { text: q.correctAnswer } : undefined,
        correctAnswers: q.correctAnswers || [],
        score: q.score || 1,
      });

      const savedQuestion = await newQuestion.save({ session });
      savedQuestions.push({ questionId: savedQuestion._id, model: q.model });
    }

    test.title = title;
    test.description = description;
    test.topic = topicDoc ? topicDoc._id : null;
    test.questions = savedQuestions;
    test.singleAttempt = singleAttempt || false;
    test.showCorrectAnswers = showCorrectAnswers || false;

    const updatedTest = await test.save({ session });

    await session.commitTransaction();
    session.endSession();

    return updatedTest;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

}


