import TestResult from "../models/TestResult.js";
import TestService from "../services/TestService.js";

const testService = new TestService();

export const getAllTests = async (req, res) => {
  try {
    res.json(await testService.getAllTests());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTestById = async (req, res) => {
  try {
    const test = await testService.getTestById(req.params.id);
    if (!test) return res.status(404).json({ message: "Тест не знайдено" });
    res.json(test);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createTest = async (req, res) => {
  try {
    const saved = await testService.createTest(req.body, req.user.id);
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteMyTest = async (req, res) => {
  try {
    await testService.deleteUserTest(req.params.id, req.user.id);
    res.json({ message: "Тест видалено" });
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

export const checkIfAttempted = async (req, res) => {
  try {
    res.json(await testService.checkAttempt(req.params.id, req.user.id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




export const getMyTests = async (req, res) => {
  try {
    const tests = await testService.getUserTests(req.user.id);
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTestByTestId = async (req, res) => {
  try {
    const { testId } = req.params;
    const test = await testService.getTestByTestId(Number(testId));
    if (!test) return res.status(404).json({ message: "Тест не знайдено" });
    res.json(test);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





export const getTestResults = async (req, res) => {
  try {
    const { id: testId } = req.params;
    const results = await TestResult.find({ test: testId })
      .populate("user", "username email");
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Помилка при завантаженні результатів тесту" });
  }
};



export const updateMyTest = async (req, res) => {
  try {
    const updated = await testService.updateTest(req.params.id, req.user.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
