import styles from "../styles/Home.module.css";

export default function TestCard({ test, onStart }) {
  return (
    <div className={styles.testCard}>
      <h3>{test.title}</h3>
      <p>{test.description}</p>
      <p>
        <strong>Питань:</strong> {test.questions.length}
      </p>
      <p>
        <strong>Тема:</strong>{" "}
        {test.topic ? test.topic.name : "-"}
      </p>
      <p>ID тесту: {test.testId}</p>

      <button onClick={() => onStart(test)}>
        Пройти тест
      </button>
    </div>
  );
}
