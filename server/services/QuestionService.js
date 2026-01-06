import mongoose from "mongoose";

export default class QuestionService {
  constructor() {
    this.models = {
      SingleChoiceQuestion: mongoose.model("SingleChoiceQuestion"),
      MultipleChoiceQuestion: mongoose.model("MultipleChoiceQuestion"),
      MatchingQuestion: mongoose.model("MatchingQuestion"),
    };
  }

  async getAllQuestions() {
    const result = {};

    for (const [name, Model] of Object.entries(this.models)) {
      result[name] = await Model.find().populate("type");
    }

    return result;
  }

  async getQuestionById(model, id) {
    const Model = this.models[model];
    if (!Model) throw new Error("Невідома модель питання");

    const question = await Model.findById(id).populate("type");
    if (!question) throw new Error("Питання не знайдено");

    return question;
  }

  async createQuestion(data) {
    const { model, text, type, options, correctAnswer, correctAnswers } = data;

    const Model = this.models[model];
    if (!Model) throw new Error("Невідома модель питання");

    if (!text || !type) throw new Error("Потрібно вказати text та type");

    let questionData = { text, type, options, correctAnswer, correctAnswers };

    const question = new Model(questionData);
    return await question.save();
  }
}
