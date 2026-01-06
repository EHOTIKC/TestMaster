import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../styles/ChangePassword.module.css";

import { API_URL } from "../config.js";

export default function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (form.newPassword !== form.confirmNewPassword) {
      setMessage("Нові паролі не співпадають");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API_URL}/api/auth/change-password`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(res.data.message);
      setForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      setTimeout(() => navigate("/"), 500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Сталася помилка");
    }
  };

  return (
    <div className={styles.changePasswordContainer}>
      <h2>Змінити пароль</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          name="currentPassword"
          placeholder="Поточний пароль"
          value={form.currentPassword}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="newPassword"
          placeholder="Новий пароль"
          value={form.newPassword}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmNewPassword"
          placeholder="Підтвердіть новий пароль"
          value={form.confirmNewPassword}
          onChange={handleChange}
          required
        />
        <button type="submit" className={styles.changePasswordButton}>
          Змінити пароль
        </button>
      </form>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
