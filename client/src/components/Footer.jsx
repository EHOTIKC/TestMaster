import styles from "../styles/Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p>{new Date().getFullYear()} TestMaster</p>
      </div>
    </footer>
  );
}
