import QuestionType from "./models/QuestionType.js";

export const initQuestionTypes = async () => {
  const types = [
    {
      name: "одна відповідь",
      model: "SingleChoiceQuestion",
    },
    {
      name: "кілька відповідей",
      model: "MultipleChoiceQuestion",
    },
    {
      name: "співставлення",
      model: "MatchingQuestion",
    },

  ];

  
  for (const type of types) {
    const exists = await QuestionType.findOne({ model: type.model });
    if (!exists) {
      await QuestionType.create(type);
      console.log(`Додано тип питання: ${type.name} (${type.model})`);
    } else {
      console.log(`Тип питання вже існує: ${type.model}`);
    }
  }
};
