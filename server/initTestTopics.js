import TestTopic from "./models/TestTopic.js";

export const initTestTopics = async () => {
  const topics = ["Математика", "Програмування", "Англійська мова"];

  for (const name of topics) {
    const exists = await TestTopic.findOne({ name });
    if (exists) {
      console.log(`Тема тесту вже існує: ${name}`);
    } else {
      await TestTopic.create({ name });
      console.log(`Тема тесту створена: ${name}`);
    }
  }
};
