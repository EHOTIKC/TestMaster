import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/AdminPanel.module.css";

import { API_URL } from "../config.js";


export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [message, setMessage] = useState("");
  const [adminLogs, setAdminLogs] = useState([]);


  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
    fetchTests();
    fetchAdminLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Не вдалося завантажити користувачів");
    }
  };

  const fetchTests = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/tests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTests(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Не вдалося завантажити тести");
    }
  };

  const fetchAdminLogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdminLogs(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Не вдалося завантажити логи адміністраторів");
    }
  };

  const handleSelectUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const handleSelectTest = (id) => {
    setSelectedTests((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleDeleteUsers = async () => {
    if (selectedUsers.length === 0) return;
    try {
      await axios.delete(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { ids: selectedUsers },
      });
      setMessage("Видалено користувачів");
      setSelectedUsers([]);
      fetchUsers();
      fetchAdminLogs();
    } catch (err) {
      console.error(err);
      setMessage("Помилка при видаленні користувачів");
    }
  };

  const handleDeleteTests = async () => {
    if (selectedTests.length === 0) return;
    try {
      await axios.delete(`${API_URL}/api/admin/tests`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { ids: selectedTests },
      });
      setMessage("Видалено тести");
      setSelectedTests([]);
      fetchTests();
      fetchAdminLogs();
    } catch (err) {
      console.error(err);
      setMessage("Помилка при видаленні тестів");
    }
  };

  return (
    <div className={styles.adminPanelContainer}>
      <h2>Адмін панель</h2>
      {message && <p className={styles.message}>{message}</p>}

      <div className={styles.adminSection}>
        <h3>Користувачі</h3>
        <button onClick={handleDeleteUsers} className={styles.deleteBtn}>
          Видалити вибраних
        </button>
        <table>
          <thead>
            <tr>
              <th>Вибрати</th>
              <th>Ім’я</th>
              <th>Email</th>
              <th>Роль</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>
                  {u.role !== "admin" ? (
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(u._id)}
                      onChange={() => handleSelectUser(u._id)}
                    />
                  ) : (
                    <span style={{ color: "gray", fontStyle: "italic" }}>—</span>
                  )}
                </td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      <div className={styles.adminSection}>
        <h3>Тести</h3>
        <button onClick={handleDeleteTests} className={styles.deleteBtn}>
          Видалити вибрані
        </button>
        <table>
          <thead>
            <tr>
              <th>Вибрати</th>
              <th>Назва тесту</th>
              <th>Тема</th>
              <th>Створено</th>
            </tr>
          </thead>

          <tbody>
            {tests.map((t) => (
              <tr key={t._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedTests.includes(t._id)}
                    onChange={() => handleSelectTest(t._id)}
                  />
                </td>
                <td>{t.title}</td>
                <td>{t.topic ? t.topic.name : "—"}</td>
                <td>{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
      <div className={styles.adminSection}>
        <h3>Журнал дій адміністраторів</h3>
        <table>
          <thead>
            <tr>
              <th>Дата</th>
              <th>Адмін</th>
              <th>Дія</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {adminLogs.length > 0 ? (
              adminLogs.map((log) => (
                <tr key={log._id}>
                  <td>{new Date(log.date).toLocaleString()}</td>
                  <td>{log.admin ? log.admin.username : "—"}</td>
                  <td style={{ whiteSpace: "pre-wrap" }}>{log.action}</td>
                  <td>{log.ip || "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "12px" }}>
                  Немає записів
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
