import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  testId: { type: Number, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: "TestTopic", default: null },
  questions: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
      model: {
        type: String,
        required: true,
        enum: ["SingleChoiceQuestion", "MultipleChoiceQuestion", "MatchingQuestion"],
      },
    },
  ],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  singleAttempt: { type: Boolean, default: false },
  showCorrectAnswers: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});


testSchema.pre("save", async function (next) {
  if (this.testId) return next();

  try {
    console.log("🔧 Автогенерація testId...");
    const lastTest = await mongoose.model("Test").findOne({}).sort({ testId: -1 });
    const nextId = lastTest && lastTest.testId ? lastTest.testId + 1 : 1;
    this.testId = nextId;
    console.log(`Новий testId: ${this.testId}`);
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("Test", testSchema);
