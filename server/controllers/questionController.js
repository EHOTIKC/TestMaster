import QuestionService from "../services/QuestionService.js";

const questionService = new QuestionService();

export const getAllQuestions = async (req, res) => {
  try {
    const questions = await questionService.getAllQuestions();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const { model, id } = req.params;
    const question = await questionService.getQuestionById(model, id);
    res.json(question);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const created = await questionService.createQuestion(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
