import mongoose from "mongoose";

const testTopicSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

const TestTopic = mongoose.model("TestTopic", testTopicSchema);

export default TestTopic;
