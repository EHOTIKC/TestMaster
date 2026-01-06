import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import styles from "../styles/EditTest.module.css";
import { API_URL } from "../config.js";
import QuestionBlock from "../components/QuestionBlock";
import { useTestForm } from "../hooks/useTestForm.jsx";

export default function EditTest() {

const navigate = useNavigate();
  const { id } = useParams();

  const {
    form,
    setForm,
    topics,
    setTopics,
    selectedTopic,
    setSelectedTopic,
    message,
    setMessage,
    messageType,
    setMessageType,
    handleChange,
    handleToggle,
    handleQuestionChange,
    handleQuestionTypeChange,
    handleOptionChange,
    handleSingleCorrectChange,
    handleCorrectAnswersChange,
    addOption,
    removeOption,
    addMatchingPair,
    removeMatchingPair,
    addQuestion,
    removeQuestion,
    autoResize
  } = useTestForm({
    title: "",
    description: "",
    questions: [{ questionText: "", options: ["", "", "", ""], correctAnswer: "", correctAnswers: [], questionType: "одна відповідь" }],
    singleAttempt: false,
    showCorrectAnswers: false,
  });

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/test-topics`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTopics(res.data);
      } catch (err) {
        console.error("Не вдалося завантажити теми тестів:", err);
      }
    };

    const fetchTest = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/tests/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const testData = res.data;

        const mappedQuestions = testData.questions.map(q => {
          const model = q.type?.model;

          if (model === "SingleChoiceQuestion") {
            return {
              questionText: q.text,
              options: q.options?.map(o => o.text) || ["", "", "", ""],
              correctAnswer: q.correctAnswer?.text || "",
              correctAnswers: [],
              questionType: q.type?.name || "одна відповідь",
            };
          } else if (model === "MultipleChoiceQuestion") {
            return {
              questionText: q.text,
              options: q.options?.map(o => o.text) || ["", "", "", ""],
              correctAnswer: "",
              correctAnswers: q.correctAnswers?.map(a => a.text) || [],
              questionType: q.type?.name || "кілька відповідей",
            };
          } else if (model === "MatchingQuestion") {
            return {
              questionText: q.text,
              options: q.options?.map(o => ({ key: o.matchingKey, value: o.text })) || [
                { key: "", value: "" },
                { key: "", value: "" },
                { key: "", value: "" },
              ],
              correctAnswer: "",
              correctAnswers: q.correctAnswers?.map(a => ({ key: a.matchingKey, value: a.text })) || [],
              questionType: q.type?.name || "співставлення",
            };
          } else {
            return {
              questionText: q.text,
              options: [],
              correctAnswer: "",
              correctAnswers: [],
              questionType: "одна відповідь",
            };
          }
        });

        setForm({
          title: testData.title || "",
          description: testData.description || "",
          questions: mappedQuestions,
          singleAttempt: testData.singleAttempt || false,
          showCorrectAnswers: testData.showCorrectAnswers || false,
        });

        setSelectedTopic(testData.topic?._id || null);
      } catch (err) {
        console.error("Не вдалося завантажити тест:", err);
        if (err.response && err.response.status === 404) {
          navigate("/not-found");
        } else {
          setMessage("❌ Помилка при завантаженні тесту");
          setMessageType("error");
        }
      }
    };

    fetchTopics();
    fetchTest();
  }, [id, setTopics, setForm, setSelectedTopic, setMessage, setMessageType, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    for (let i = 0; i < form.questions.length; i++) {
      const q = form.questions[i];

      const uniqueOptions = new Set(q.options.map(o => (typeof o === "string" ? o.trim() : o)));
      if (uniqueOptions.size !== q.options.length) {
        setMessage(`⚠️ У питанні ${i + 1} є дубльовані варіанти`);
        setMessageType("error");
        return;
      }

      const nonEmptyOptions = q.options.filter(opt => {
        if (typeof opt === "string") return opt.trim() !== "";
        return opt.key.trim() !== "" && opt.value.trim() !== "";
      });
      if (nonEmptyOptions.length === 0) {
        setMessage(`⚠️ У питанні ${i + 1} потрібно вказати хоча б один варіант`);
        setMessageType("error");
        return;
      }

      if (q.questionType === "одна відповідь" && !q.correctAnswer) {
        setMessage(`⚠️ У питанні ${i + 1} не вибрано правильну відповідь`);
        setMessageType("error");
        return;
      }

      if (q.questionType === "кілька відповідей" && q.correctAnswers.length === 0) {
        setMessage(`⚠️ У питанні ${i + 1} потрібно вибрати хоча б одну правильну`);
        setMessageType("error");
        return;
      }
    }

    try {
      const questionsPayload = form.questions.map((q) => {
        if (q.questionType === "одна відповідь") {
          return {
            model: "SingleChoiceQuestion",
            text: q.questionText,
            options: q.options.map(opt => ({ text: opt })),
            correctAnswer: q.correctAnswer,
          };
        }
        if (q.questionType === "кілька відповідей") {
          return {
            model: "MultipleChoiceQuestion",
            text: q.questionText,
            options: q.options.map(opt => ({ text: opt })),
            correctAnswers: q.correctAnswers.map(a => ({ text: a })),
          };
        }
        if (q.questionType === "співставлення") {
          return {
            model: "MatchingQuestion",
            text: q.questionText,
            options: q.options.map(pair => ({
              text: pair.value || "",
              matchingKey: pair.key || "",
            })),
            correctAnswers: q.options.map(pair => ({
              text: pair.value || "",
              matchingKey: pair.key || "",
            })),
          };
        }
        return q;
      });

      const payload = {
        title: form.title,
        description: form.description,
        topic: selectedTopic || null,
        questions: questionsPayload,
        singleAttempt: form.singleAttempt,
        showCorrectAnswers: form.showCorrectAnswers,
      };

      const token = localStorage.getItem("token");

      await axios.put(`${API_URL}/api/tests/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("✅ Тест успішно оновлено!");
      setMessageType("success");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      console.error("Error updating test:", err);
      setMessage("❌ Помилка при оновленні тесту");
      setMessageType("error");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Редагувати тест</h2>
      <form onSubmit={handleSubmit} className={styles.createTestForm}>
        <input type="text" name="title" placeholder="Назва тесту" value={form.title} onChange={handleChange} className={styles.formInput} required />
        <textarea name="description" placeholder="Опис тесту" value={form.description} onChange={handleChange} className={styles.formTextarea} required />

        <label>Тема тесту:</label>
        <select className={styles.formSelect} value={selectedTopic || ""} onChange={(e) => setSelectedTopic(e.target.value)}>
          <option value="">Без теми</option>
          {topics.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>

        <div className={styles.testOptions}>
          <label>
            <input type="checkbox" checked={form.singleAttempt} onChange={() => handleToggle("singleAttempt")} />
            Дозволити лише одне проходження тесту
          </label>
          <label>
            <input type="checkbox" checked={form.showCorrectAnswers} onChange={() => handleToggle("showCorrectAnswers")} />
            Показувати правильні відповіді після завершення
          </label>
        </div>

        <h3>Питання:</h3>
        {form.questions.map((q, qIndex) => (
          <QuestionBlock
            key={qIndex}
            q={q}
            qIndex={qIndex}
            onQuestionChange={handleQuestionChange}
            onQuestionTypeChange={handleQuestionTypeChange}
            onOptionChange={handleOptionChange}
            onSingleCorrectChange={handleSingleCorrectChange}
            onCorrectAnswersChange={handleCorrectAnswersChange}
            onRemoveOption={removeOption}
            onAddOption={addOption}
            onAddMatchingPair={addMatchingPair}
            onRemoveMatchingPair={removeMatchingPair}
            onRemoveQuestion={removeQuestion}
            onChangeMatchingKey={(qIdx, optIdx, value) => {
              const updated = [...form.questions];
              updated[qIdx].options[optIdx].key = value;
              setForm({ ...form, questions: updated });
            }}
            onChangeMatchingValue={(qIdx, optIdx, value) => {
              const updated = [...form.questions];
              updated[qIdx].options[optIdx].value = value;
              setForm({ ...form, questions: updated });
            }}
            autoResize={autoResize}
          />
        ))}

        <button type="button" onClick={addQuestion} className={styles.addQuestionBtn}>➕ Додати питання</button>
        <button type="submit" className={styles.submitBtn}>✅ Оновити тест</button>
      </form>
        {message && (
          <p
            className={`${styles.message} ${
              messageType === "success" ? styles.success : messageType === "error" ? styles.error : ""
            }`}
          >
            {message}
          </p>
        )}
    </div>
  );
}
