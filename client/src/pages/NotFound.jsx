import { Link } from "react-router-dom";
import styles from "../styles/NotFound.module.css";

export default function NotFound() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>404 — Сторінку не знайдено</h1>
      <p className={styles.text}>
        Можливо, ви помилилися у введенні адреси або сторінку було видалено.
      </p>
      <Link to="/" className={styles.link}>
        ⬅ Повернутися на головну
      </Link>
    </div>
  );
}
