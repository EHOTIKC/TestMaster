import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../styles/MyTests.module.css";
import { API_URL } from "../config.js";


export default function MyTests() {
  const [myTests, setMyTests] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" або "error"
  const [selectedTestResults, setSelectedTestResults] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyTests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/tests/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyTests(res.data);
      } catch (err) {
        console.error("❌ Не вдалося завантажити тести:", err);
        setMessage("❌ Помилка при завантаженні тестів");
      }
    };

    fetchMyTests();
  }, []);

  const handleViewResults = async (testId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_URL}/api/tests/${testId}/results`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedTestResults({ testId, results: res.data });
      setIsModalOpen(true);
    } catch (err) {
      console.error("Не вдалося завантажити результати:", err);
      setMessage("❌ Помилка при завантаженні результатів тесту");
    }
  };
  

  const handleDeleteTest = async (testId) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цей тест?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/tests/${testId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyTests((prev) => prev.filter((t) => t._id !== testId));
      setMessage("✅ Тест успішно видалено");
      setMessageType("success");
    } catch (err) {
      console.error("Помилка при видаленні тесту:", err);
      setMessage("❌ Не вдалося видалити тест");
      setMessageType("error");
    }
  };




  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTestResults(null);
  };

  return (
    <div className={styles.myTestsContainer}>
      <h2>Мої тести</h2>
      {message && <p className={`${styles.message} ${styles[messageType]}`}>{message}</p>}

      {myTests.length === 0 && !message ? (
        <p>У вас поки немає створених тестів.</p>
      ) : (
        <div className={styles.testsList}>

        {myTests.map((test) => (
          <div key={test._id} className={styles.testCard}>
            <h3>{test.title}</h3>
            {test.description && <p>{test.description}</p>}
            {test.topic && <p className={styles.topic}>Тема: {test.topic.name}</p>}
            <p>Питань: {test.questions.length}</p>
            <button
              className={styles.viewBtn}
              onClick={() => handleViewResults(test._id)}
            >
              Переглянути результати
            </button>
            <button
              className={styles.editBtn}
              onClick={() => navigate(`/edit-test/${test._id}`)}
            >
              Редагувати тест
            </button>
            <button
              className={styles.deleteBtn}
              onClick={() => handleDeleteTest(test._id)}
            >
              Видалити тест
            </button>
          </div>
        ))}

        </div>
      )}

      {isModalOpen && selectedTestResults && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Результати тесту</h3>
            {selectedTestResults.results.length === 0 ? (
              <p>Поки ніхто не проходив цей тест.</p>
            ) : (
              <>
                <div className={styles.testStats}>
                  <p>
                    <strong>Кількість проходжень:</strong>{" "}
                    {selectedTestResults.results.length}
                  </p>
                  <p>
                    <strong>Середній бал:</strong>{" "}
                    {(
                      selectedTestResults.results.reduce((sum, r) => sum + r.score, 0) /
                      selectedTestResults.results.length
                    ).toFixed(2)}
                    %
                  </p>
                </div>

                <table>
                  <thead>
                    <tr>
                      <th>Користувач</th>
                      <th>Результат (%)</th>
                      <th>Дата проходження</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTestResults.results.map((r) => (
                      <tr key={r._id}>
                        <td>{r.user.username}</td>
                        <td>{r.score}</td>
                        <td>{new Date(r.date).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            <button className={styles.closeBtn} onClick={closeModal}>
              Закрити
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
