import mongoose from "mongoose";

const { Schema } = mongoose;

const baseQuestionSchema = new Schema(
  {
    text: { type: String, required: true },
    type: { type: Schema.Types.ObjectId, ref: "QuestionType", required: true },
    optionsCount: { type: Number, default: 4, min: 1 },
    score: { type: Number, default: 1, min: 0 },
  },
  { discriminatorKey: "questionKind", collection: "questions" }
);

const Question = mongoose.model("Question", baseQuestionSchema);

const singleChoiceSchema = new Schema({
  options: [{ text: { type: String, required: true } }],
  correctAnswer: { text: { type: String, required: true } },
});

const multipleChoiceSchema = new Schema({
  options: [{ text: { type: String, required: true } }],
  correctAnswers: [{ text: { type: String, required: true } }],
});

const matchingSchema = new Schema({
  options: [
    { text: { type: String, required: true }, matchingKey: { type: String, required: true } },
  ],
  correctAnswers: [
    { text: { type: String, required: true }, matchingKey: { type: String, required: true } },
  ],
});

const SingleChoiceQuestion = Question.discriminator("SingleChoiceQuestion", singleChoiceSchema);
const MultipleChoiceQuestion = Question.discriminator("MultipleChoiceQuestion", multipleChoiceSchema);
const MatchingQuestion = Question.discriminator("MatchingQuestion", matchingSchema);

export { Question, SingleChoiceQuestion, MultipleChoiceQuestion, MatchingQuestion };
