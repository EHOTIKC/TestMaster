import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/ProfilePage.module.css";
import { API_URL } from "../config.js";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailedResult, setDetailedResult] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");

        const userRes = await axios.get(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        const resultsRes = await axios.get(`${API_URL}/api/test-results/my-results`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setResults(Array.isArray(resultsRes.data) ? resultsRes.data : []);
      } catch (err) {
        console.error("Помилка при завантаженні профілю:", err);
        setMessage("❌ Не вдалося завантажити профіль або результати");
      }
    };

    fetchProfileData();
  }, []);

  const handleViewDetails = async (resultId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/test-results/${resultId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDetailedResult(res.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Помилка при завантаженні деталей результату:", err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDetailedResult(null);
  };

  if (!user) return <p className={styles.loading}>Завантаження профілю...</p>;

  return (
    <div className={styles.profileContainer}>
      <h2>Мій профіль</h2>
      {message && <p className={styles.message}>{message}</p>}

      <div className={styles.profileInfo}>
        <p><strong>Ім’я користувача:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Дата реєстрації:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
      </div>

      <h3 className={styles.resultsTitle}>Мої результати тестів</h3>

      {results.length === 0 ? (
        <p>Ви ще не проходили жодного тесту.</p>
      ) : (
        <table className={styles.resultsTable}>
          <thead>
            <tr>
              <th>Назва тесту</th>
              <th>Результат (%)</th>
              <th>Дата проходження</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r._id}>
                <td>{r.test?.title || "Невідомо"}</td>
                <td>{r.score}</td>
                <td>{new Date(r.date).toLocaleString()}</td>
                <td>
                  <button
                    className={styles.viewBtn}
                    onClick={() => handleViewDetails(r._id)}
                  >
                    Переглянути деталі
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isModalOpen && detailedResult && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>{detailedResult.test.title}</h3>
            <p><strong>Результат:</strong> {detailedResult.score}%</p>

            <div className={styles.questionsList}>
              {detailedResult.questions.map((q, i) => (
                <div key={q._id} className={styles.questionBlock}>
                  <p><strong>Питання {i + 1}:</strong> {typeof q.text === "object" ? q.text.text : q.text}</p>
                  <p>
                    <strong>Відповідь користувача:</strong>{" "}
                    <span>
                      {Array.isArray(q.userAnswer)
                        ? q.userAnswer.map(a => (typeof a === "object" ? a.text : a)).join(", ")
                        : typeof q.userAnswer === "object"
                        ? q.userAnswer.text
                        : q.userAnswer || "—"}
                    </span>
                  </p>
                  {detailedResult.test.showCorrectAnswers && (
                    <p>
                      <strong>Правильна відповідь:</strong>{" "}
                      <span>
                        {Array.isArray(q.correctAnswer)
                          ? q.correctAnswer.map(a => (typeof a === "object" ? a.text : a)).join(", ")
                          : typeof q.correctAnswer === "object"
                          ? q.correctAnswer.text
                          : q.correctAnswer || "—"}
                      </span>
                    </p>
                  )}
                </div>
              ))}
            </div>

            <button className={styles.closeBtn} onClick={closeModal}>
              Закрити
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
