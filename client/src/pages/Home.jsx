import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTests } from "../api/tests";
import styles from "../styles/Home.module.css";
import { API_URL } from "../config.js";

import TestCard from "../components/TestCard";


const MAX_TESTS_DISPLAY = 10;

export default function Home() {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [sortOption, setSortOption] = useState("");
  const [filterTopic, setFilterTopic] = useState("");
  const [minQuestions, setMinQuestions] = useState("");
  const [maxQuestions, setMaxQuestions] = useState("");
  const navigate = useNavigate();

  const [attemptStatuses, setAttemptStatuses] = useState({});

  
  const loadUserRole = () => {
    
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setUserRole(decoded.role);
      } catch {
        setUserRole(null);
      }
    } else {
      setUserRole(null);
    }
  };

  useEffect(() => {
    loadUserRole();
    const handleAuthChange = () => loadUserRole();
    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/register");
  }, [navigate]);


  useEffect(() => {
    if (!userRole) return;
    const fetchTests = async () => {
      try {
        const data = await getAllTests();
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        const limited = shuffled.slice(0, MAX_TESTS_DISPLAY);
        setTests(limited);
        setFilteredTests(limited);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, [userRole]);

useEffect(() => {
    if (!filteredTests.length) return;

    const checkAttempts = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const statuses = {};
      for (const test of filteredTests) {
        try {
          const res = await fetch(`${API_URL}/api/tests/${test._id}/checkAttempt`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          statuses[test._id] = { 
            attempted: data.attempted, 
            singleAttempt: data.singleAttempt 
          };
        } catch (err) {
          console.error(`Помилка перевірки спроби для тесту ${test._id}:`, err);
          statuses[test._id] = { attempted: false, singleAttempt: false };
        }
      }
      setAttemptStatuses(statuses);
    };

    checkAttempts();
}, [filteredTests]);
  const sortTests = (option, list) => {
    let sorted = [...list];
    switch (option) {
      case "title-asc":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "questions-asc":
        sorted.sort((a, b) => a.questions.length - b.questions.length);
        break;
      case "questions-desc":
        sorted.sort((a, b) => b.questions.length - a.questions.length);
        break;
      case "id-asc":
        sorted.sort((a, b) => a.testId - b.testId);
        break;
      case "id-desc":
        sorted.sort((a, b) => b.testId - a.testId);
        break;
      default:
        break;
    }
    return sorted;
  };
const handleStartTest = async (test) => {
  const token = localStorage.getItem("token");
  const status = attemptStatuses[test._id];

  if (status?.singleAttempt && status?.attempted) {
    alert("❌ Ви вже проходили цей тест. Повторна спроба недоступна.");
    return;
  }

  if (!status) {
    try {
      const res = await fetch(`${API_URL}/api/tests/${test._id}/checkAttempt`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAttemptStatuses((prev) => ({ ...prev, [test._id]: data }));

      if (data.singleAttempt && data.attempted) {
        alert("❌ Ви вже проходили цей тест. Повторна спроба недоступна.");
        return;
      }
    } catch (err) {
      console.error(err);
      alert("❌ Помилка при перевірці тесту");
      return;
    }
  }

  navigate(`/test/${test._id}`);
};


  const applyFilters = async (baseList = tests, isFullList = false) => {
    let filtered = [...baseList];

    if (filterTopic) {
      filtered = filtered.filter(
        (t) => t.topic && t.topic.name === filterTopic
      );
    }

    if (minQuestions) {
      filtered = filtered.filter((t) => t.questions.length >= +minQuestions);
    }

    if (maxQuestions) {
      filtered = filtered.filter((t) => t.questions.length <= +maxQuestions);
    }

    filtered = sortTests(sortOption, filtered);

    if ((filtered.length === 0 || filtered.length < MAX_TESTS_DISPLAY) && !isFullList) {
      const allData = await getAllTests();
      applyFilters(allData, true);
      return;
    }

    const limited = isFullList ? filtered.slice(0, MAX_TESTS_DISPLAY) : filtered;
    setFilteredTests(limited);
  };

  useEffect(() => {
    if (!tests.length) return;
    applyFilters();
  }, [sortOption, filterTopic, minQuestions, maxQuestions, tests]);


  const handleSearch = async () => {
    setError("");
    if (!searchId.trim()) {
      setError("Введіть ID тесту");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/tests/by-id/${searchId}`
      );
      if (!response.ok) {
        setError("Тест не знайдено");
        return;
      }
      const test = await response.json();
      navigate(`/test/${test._id}`);
    } catch {
      setError("Помилка при пошуку тесту");
    }
  };

  if (loading) return <p>Завантаження тестів...</p>;

  const allTopics = Array.from(
    new Set(tests.map((t) => t.topic?.name).filter(Boolean))
  );

  return (
    <div className={styles.homeContainer}>
      <h1>Вітаю у веб-застосунку тестування!</h1>
      <p>Оберіть тест або знайдіть за ID:</p>

      <div className={styles.searchContainer}>
        <input
          type="number"
          placeholder="Введіть ID тесту..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className={styles.searchInput}
        />
        <button className={styles.searchButton} onClick={handleSearch}>
          Пошук
        </button>
      </div>
      {error && <p className={styles.errorMessage}>{error}</p>}

      <div className={styles.filterSortContainer}>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="">Сортувати...</option>
          <option value="title-asc">Назва: A → Я</option>
          <option value="title-desc">Назва: Я → A</option>
          <option value="questions-asc">Питання: ↑</option>
          <option value="questions-desc">Питання: ↓</option>
          <option value="id-asc">ID: ↑</option>
          <option value="id-desc">ID: ↓</option>
        </select>


        <select
          value={filterTopic}
          onChange={(e) => setFilterTopic(e.target.value)}
        >
          <option value="">Усі теми</option>
          {allTopics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>


        <input
          type="number"
          placeholder="Мін. питань"
          value={minQuestions}
          onChange={(e) => setMinQuestions(e.target.value)}
        />
        <input
          type="number"
          placeholder="Макс. питань"
          value={maxQuestions}
          onChange={(e) => setMaxQuestions(e.target.value)}
        />
      </div>

      {(userRole === "teacher" || userRole === "admin") && (
        <button
          className={styles.addTestButton}
          onClick={() => navigate("/create-test")}
        >
          Створити тест
        </button>
      )}
      <div className={styles.testsList}>
        {filteredTests.length > 0 ? (
          filteredTests.map((test) => (
            <TestCard
              key={test._id}
              test={test}
              onStart={handleStartTest}
            />
          ))
        ) : (
          <p>Немає тестів за цими параметрами.</p>
        )}
      </div>
    </div>
  );
}
