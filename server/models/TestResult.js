import mongoose from "mongoose";

const testResultSchema = new mongoose.Schema({
  test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answers: { type: Object, required: true },
  score: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

export default mongoose.model("TestResult", testResultSchema);
