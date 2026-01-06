import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/CreateTest.module.css";
import QuestionBlock from "../components/QuestionBlock";

import { API_URL } from "../config.js";
import { useTestForm } from "../hooks/useTestForm.jsx";

export default function CreateTest() {
  const navigate = useNavigate();
  
  const {
    form, setForm, topics, selectedTopic, setSelectedTopic,
    message, setMessage, messageType, setMessageType,
    handleChange, handleToggle, handleQuestionChange, handleQuestionTypeChange,
    handleOptionChange, handleSingleCorrectChange, handleCorrectAnswersChange,
    addOption, removeOption, addMatchingPair, removeMatchingPair,
    addQuestion, removeQuestion, autoResize
  } = useTestForm({
    title: "",
    description: "",
    questions: [{
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      correctAnswers: [],
      questionType: "одна відповідь",
      score: 1
    }],

    singleAttempt: false,
    showCorrectAnswers: false,
  });

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
      const base = { text: q.questionText, score: q.score || 1 };

      if (q.questionType === "одна відповідь") {
        return {
          ...base,
          model: "SingleChoiceQuestion",
          options: q.options.map(opt => ({ text: opt })),
          correctAnswer: q.correctAnswer,
        };
      }
      if (q.questionType === "кілька відповідей") {
        return {
          ...base,
          model: "MultipleChoiceQuestion",
          options: q.options.map(opt => ({ text: opt })),
          correctAnswers: q.correctAnswers.map(a => ({ text: a })),
        };
      }
      if (q.questionType === "співставлення") {
        return {
          ...base,
          model: "MatchingQuestion",
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

      await axios.post(`${API_URL}/api/tests`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("✅ Тест успішно створено!");
      setMessageType("success");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      console.error("Error creating test:", err);
      setMessage("❌ Помилка при створенні тесту");
      setMessageType("error");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Створити новий тест</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input type="text" name="title" placeholder="Назва тесту" value={form.title} onChange={handleChange} required />
        <textarea name="description" placeholder="Опис тесту" value={form.description} onChange={handleChange} required />

        <label>Тема тесту:</label>
        <select value={selectedTopic || ""} onChange={(e) => setSelectedTopic(e.target.value)}>
          <option value="">Без теми</option>
          {topics.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>

        <div className={styles.testOptions}>
          <label>
            <input
              type="checkbox"
              checked={form.singleAttempt}
              onChange={() => handleToggle("singleAttempt")}
            />{" "}
            Дозволити лише одне проходження тесту
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.showCorrectAnswers}
              onChange={() => handleToggle("showCorrectAnswers")}
            />{" "}
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

        <button type="button" onClick={addQuestion} className={styles.addQuestionBtn}>
          ➕ Додати питання
        </button>

        <button type="submit" className={styles.submitBtn}>✅ Зберегти тест</button>
      </form>

        {message && <p className={`${styles.message} ${styles[messageType]}`}>{message}</p>}
    </div>
  );
}
