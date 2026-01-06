import mongoose from "mongoose";

const questionTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  model: { type: String },
});

const QuestionType = mongoose.model("QuestionType", questionTypeSchema);

export default QuestionType;

