import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config.js";

export function useTestForm(initialForm) {
  const [form, setForm] = useState(initialForm);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Завантаження тем
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/test-topics`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTopics(res.data);
      } catch (err) {
        console.error("Не вдалося завантажити теми тестів:", err);
      }
    };
    fetchTopics();
  }, []);


  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleToggle = (field) => setForm((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleQuestionChange = (index, field, value) => {
    const updated = [...form.questions];
    updated[index][field] = value;
    setForm({ ...form, questions: updated });
  };

  const handleQuestionTypeChange = (index, value) => {
    const updated = [...form.questions];
    updated[index].questionType = value;

    if (value === "кілька відповідей") {
      updated[index].options = ["", "", "", ""];
      updated[index].correctAnswers = [];
    } else if (value === "співставлення") {
      updated[index].options = [
        { key: "", value: "" },
        { key: "", value: "" },
        { key: "", value: "" },
      ];
    } else {
      updated[index].options = ["", "", "", ""];
      updated[index].correctAnswer = "";
      updated[index].correctAnswers = [];
    }
    setForm({ ...form, questions: updated });
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...form.questions];
    updated[qIndex].options[optIndex] = value;
    setForm({ ...form, questions: updated });
  };

  const handleSingleCorrectChange = (qIndex, value) => {
    const updated = [...form.questions];
    updated[qIndex].correctAnswer = value;
    setForm({ ...form, questions: updated });
  };

  const handleCorrectAnswersChange = (qIndex, optIndex) => {
    const updated = [...form.questions];
    const option = updated[qIndex].options[optIndex];
    const current = updated[qIndex].correctAnswers || [];
    if (current.includes(option)) {
      updated[qIndex].correctAnswers = current.filter((a) => a !== option);
    } else {
      updated[qIndex].correctAnswers = [...current, option];
    }
    setForm({ ...form, questions: updated });
  };

  const addOption = (qIndex) => {
    const updated = [...form.questions];
    updated[qIndex].options.push("");
    setForm({ ...form, questions: updated });
  };

  const removeOption = (qIndex, optIndex) => {
    const updated = [...form.questions];
    updated[qIndex].options.splice(optIndex, 1);
    setForm({ ...form, questions: updated });
  };

  const addMatchingPair = (qIndex) => {
    const updated = [...form.questions];
    updated[qIndex].options.push({ key: "", value: "" });
    setForm({ ...form, questions: updated });
  };

  const removeMatchingPair = (qIndex, pairIndex) => {
    const updated = [...form.questions];
    updated[qIndex].options.splice(pairIndex, 1);
    setForm({ ...form, questions: updated });
  };

  const addQuestion = () => {
    setForm({
      ...form,
      questions: [
        ...form.questions,
        {
          questionText: "",
          options: ["", "", "", ""],
          correctAnswer: "",
          correctAnswers: [],
          questionType: "одна відповідь",
        },
      ],
    });
  };

  const removeQuestion = (index) => {
    const updated = [...form.questions];
    updated.splice(index, 1);
    setForm({ ...form, questions: updated });
  };

  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return {
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
    autoResize,
  };
}


