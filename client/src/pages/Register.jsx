import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Register.module.css";

import { API_URL } from "../config.js";


export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setMessage("Паролі не співпадають");
      return;
    }

    try {
      const { username, email, password, role } = form;
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        email,
        password,
        role,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);

      window.dispatchEvent(new Event("authChange"));
      setMessage("Реєстрація успішна!");
      navigate("/");
    } catch (err) {
      setMessage(err.response?.data?.message || "Помилка реєстрації");
    }

  };

  return (
    <div className={styles.registerContainer}>
      <h2>Реєстрація</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Ім’я"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Пароль"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Підтвердіть пароль"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />

        <select name="role" value={form.role} onChange={handleChange}>
          <option value="student">Учень</option>
          <option value="teacher">Вчитель</option>
        </select>

        <button type="submit" className={styles.registerButton}>
          Зареєструватися
        </button>
      </form>

      <button
        className={styles.alreadyAccountButton}
        onClick={() => navigate("/login")}
      >
        Вже маєте акаунт?
      </button>



      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
