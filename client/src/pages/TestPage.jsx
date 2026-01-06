import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "../styles/TestPage.module.css";
import { API_URL } from "../config.js";
import { TestLogic } from "../utils/TestLogic.jsx";

export default function TestPage() {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  const [testLogic, setTestLogic] = useState(null);

  // -------------------- Завантаження тесту --------------------
  useEffect(() => {
    async function fetchTest() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/tests/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Тест не знайдено");
        const data = await response.json();

        // Перемішування питань та опцій
        const shuffledQuestions = data.questions.map((q) => {
          let shuffledOptions = q.options ? [...q.options] : [];

          if (
            q.type?.model === "MatchingQuestion" ||
            q.type?.name === "MatchingQuestion" ||
            q.model === "MatchingQuestion"
          ) {
            shuffledOptions = shuffledOptions.map((opt) => ({
              ...opt,
              matchingKey: opt.matchingKey,
            }));
            const rights = shuffledOptions.map((o) => o.matchingKey);
            const shuffledRights = rights.sort(() => Math.random() - 0.5);
            shuffledOptions = shuffledOptions.map((o, i) => ({
              ...o,
              matchingKey: shuffledRights[i],
            }));
          } else {
            shuffledOptions.sort(() => Math.random() - 0.5);
          }

          return { ...q, options: shuffledOptions };
        });

        setTest({ ...data, questions: shuffledQuestions });
        setTestLogic(new TestLogic({ ...data, questions: shuffledQuestions }, answers));
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTest();
  }, [id]);

  // -------------------- Відправка результатів --------------------
  useEffect(() => {
    const submitResult = async () => {
      if (!finished || !testLogic) return;

      const { scorePercent } = testLogic.calculateScore(answers);


      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/test-results/${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ answers, score: scorePercent }),
        });
        const data = await res.json();
        console.log("Результат збережено:", data);
      } catch (err) {
        console.error("Не вдалося зберегти результат:", err);
      }
    };

    submitResult();
  }, [finished, testLogic, answers, id]);

  if (loading) return <p>Завантаження тесту...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!test) return null;

  const currentQuestion = test.questions[currentQuestionIndex];
  const questionType = testLogic.getQuestionType(currentQuestion);

  // -------------------- Обробка вибору --------------------
  const handleOptionSelect = (optionText) => {
    if (questionType === "MultipleChoiceQuestion") {
      setAnswers((prev) => {
        const currentAnswers = prev[currentQuestion._id] || [];
        if (currentAnswers.includes(optionText)) {
          return {
            ...prev,
            [currentQuestion._id]: currentAnswers.filter((a) => a !== optionText),
          };
        } else {
          return {
            ...prev,
            [currentQuestion._id]: [...currentAnswers, optionText],
          };
        }
      });
    } else {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion._id]: optionText,
      }));
    }
  };

  const handleMatchSelect = (left, right) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion._id]: {
        ...prev[currentQuestion._id],
        [left]: right,
      },
    }));
  };

  // -------------------- Навігація --------------------
  const handleNext = () => {
    const userAnswer = answers[currentQuestion._id];
    setValidationMessage("");

    if (!testLogic.isAnswerValid(currentQuestion, userAnswer)) {
      setValidationMessage("❗ Ви повинні відповісти на всі поля!");
      return;
    }

    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // -------------------- Візуалізація опцій --------------------
  const renderOptions = () => {
    if (questionType === "MatchingQuestion") {
      const pairs = currentQuestion.options || [];
      const lefts = pairs.map((p) => p.text);
      const rights = pairs.map((p) => p.matchingKey).sort(() => Math.random() - 0.5);

      return (
        <div className={styles.matchingContainer}>
          {lefts.map((left, i) => {
            const selected = answers[currentQuestion._id]?.[left] || "";
            return (
              <div key={i} className={styles.matchingPair}>
                <span className={styles.matchLeft}>{left}</span>
                <select
                  className={styles.matchSelect}
                  value={selected}
                  onChange={(e) => handleMatchSelect(left, e.target.value)}
                >
                  <option value="">-- оберіть --</option>
                  {rights.map((right, j) => (
                    <option key={j} value={right}>
                      {right}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <ul className={styles.optionsList}>
        {currentQuestion.options?.map((option, i) => {
          const optionText = option.text || option;
          const selected =
            questionType === "MultipleChoiceQuestion"
              ? (answers[currentQuestion._id] || []).includes(optionText)
              : answers[currentQuestion._id] === optionText;

          return (
            <li
              key={i}
              className={selected ? styles.selected : ""}
              onClick={() => handleOptionSelect(optionText)}
            >
              {optionText}
            </li>
          );
        })}
      </ul>
    );
  };

  // -------------------- Відображення результатів --------------------
  if (finished) {
    const { totalScore, maxScore, scorePercent } = testLogic.calculateScore(answers);

    const doneDate = new Date();
    const doneDateStr = doneDate.toLocaleDateString();
    const doneTimeStr = doneDate.toLocaleTimeString();

    return (
      <div className={styles.testPage}>
        <div className={styles.resultSummary}>
          <h2>📊 Результати тесту</h2>
          <p>
            <strong>Назва тесту:</strong> {test.title}
          </p>
          <p>
            <strong>Дата проходження:</strong> {doneDateStr}
          </p>
          <p>
            <strong>Час:</strong> {doneTimeStr}
          </p>

          <p>
            <strong>Балів:</strong>{" "}
            <span className={styles.score}>{Number(totalScore.toFixed(2))}</span> з {maxScore}
          </p>

          <p>
            <strong>Результат:</strong>{" "}
            <span className={styles.scorePercent}>{scorePercent}%</span>
          </p>

          {!test.showCorrectAnswers && (
            <p className={styles.answersHidden}>
              ⚠️ Автор тесту вимкнув показ правильних відповідей.
            </p>
          )}
        </div>

        <div className={styles.answersContainer}>
          {test.questions.map((q, i) => {
            const userAnswer = answers[q._id];
            let correctAnswerDisplay = "";
            let userAnswerDisplay = "";
            const qType = testLogic.getQuestionType(q);

            if (qType === "SingleChoiceQuestion") {
              correctAnswerDisplay = q.correctAnswer?.text || "немає даних";
              userAnswerDisplay = userAnswer || "Немає";
            } else if (qType === "MultipleChoiceQuestion") {
              correctAnswerDisplay =
                q.correctAnswers?.map((a) => a.text || a).join(", ") || "немає даних";
              userAnswerDisplay = Array.isArray(userAnswer) ? userAnswer.join(", ") : "Немає";
            } else if (qType === "MatchingQuestion") {
              correctAnswerDisplay = q.correctAnswers
                ? q.correctAnswers.map((a) => `${a.text} → ${a.matchingKey}`).join(", ")
                : "немає даних";
              userAnswerDisplay = userAnswer
                ? Object.entries(userAnswer)
                    .map(([l, r]) => `${l} → ${r}`)
                    .join(", ")
                : "Немає";
            }

            return (
              <div key={i} className={styles.answerBlock}>
                <h3>{q.text}</h3>
                <p>
                  <strong>Ваші відповіді:</strong> {userAnswerDisplay}
                </p>

                {test.showCorrectAnswers && (
                  <p>
                    <strong>Правильні відповіді:</strong> {correctAnswerDisplay}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // -------------------- Відображення питання --------------------
  return (
    <div className={styles.testPage}>
      <h1>{test.title}</h1>
      <p>{test.description}</p>
      <p>
        Питання {currentQuestionIndex + 1} з {test.questions.length} ({questionType})
      </p>

      <div className={styles.questionCard}>
        <h3>{currentQuestion.text}</h3>
        {renderOptions()}

        {validationMessage && (
          <p className={styles.validationMessage}>{validationMessage}</p>
        )}

        <div className={styles.navigationButtons}>
          <button onClick={handlePrev} disabled={currentQuestionIndex === 0}>
            Попереднє
          </button>
          <button onClick={handleNext}>
            {currentQuestionIndex === test.questions.length - 1
              ? "Завершити тест"
              : "Наступне"}
          </button>
        </div>
      </div>
    </div>
  );
}
