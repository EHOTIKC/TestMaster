import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./db.js";
import QuestionType from "../models/QuestionType.js";

dotenv.config();

const seedQuestionTypes = async () => {
  await connectDB();

  const types = [
    { name: "одна відповідь", model: "SingleChoiceQuestion" },
    { name: "кілька відповідей", model: "MultipleChoiceQuestion" },
    { name: "співставлення", model: "MatchingQuestion" },
  ];

  for (const type of types) {
    const exists = await QuestionType.findOne({ model: type.model });
    if (!exists) {
      await QuestionType.create(type);
      console.log(`✅ Створено тип питання: ${type.name} (${type.model})`);
    } else {
      console.log(`ℹ️ Тип питання вже існує: ${type.model}`);
    }
  }

  mongoose.connection.close();
};

seedQuestionTypes();
