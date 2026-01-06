import TestResultService from "../services/TestResultService.js";

const service = new TestResultService();

export const saveTestResult = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user.id;
    const { answers } = req.body;

    const result = await service.saveResult(testId, userId, answers);

    if (result.error) {
      return res.status(result.status).json(result);
    }

    res.status(201).json({
      message: "Результат збережено",
      ...result
    });

  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || "Помилка" });
  }
};


export const getUserResults = async (req, res) => {
  try {
    const results = await service.getUserResults(req.user.id);

    if (!results.length)
      // return res.status(404).json({ message: "Результатів не знайдено" });
      return res.json([]);
      
    res.json(results);

  } catch (err) {
    res.status(500).json({ message: "Помилка при отриманні результатів" });
  }
};


export const getDetailedResult = async (req, res) => {
  try {
    const { resultId } = req.params;

    const result = await service.getDetailedResult(resultId, req.user.id);

    res.json(result);

  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Помилка" });
  }
};
