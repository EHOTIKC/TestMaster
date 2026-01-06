import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../styles/ForgotPassword.module.css";
import { API_URL } from "../config.js";


export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post(
        `${API_URL}/api/auth/forgot-password`,
        { email }
      );
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Сталася помилка");
    }
  };

  return (
    <div className={styles.forgotPasswordContainer}>
      <h2>Відновлення пароля</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Введіть вашу пошту"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Відправити новий пароль</button>
      </form>

      {message && <p className={styles.message}>{message}</p>}

      <button
        className={styles.alreadyAccountButton}
        onClick={() => navigate("/login")}
      >
        Повернутись до входу
      </button>
    </div>
  );
}
