import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";

import { API_URL } from "../config.js";


export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, form);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      window.dispatchEvent(new Event("authChange"));

      navigate("/");
    } catch (err) {
      setMessage(err.response?.data?.message || "Помилка входу");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Вхід</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
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
        <button type="submit" className={styles.loginButton}>Увійти</button>
      </form>

      <button
        className={styles.forgotPasswordButton}
        onClick={() => navigate("/forgot-password")}
      >
        Забули пароль?
      </button>

      <button
        className={styles.registerLinkButton}
        onClick={() => navigate("/register")}
      >
        Немає акаунта? Зареєструватися
      </button>

      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
