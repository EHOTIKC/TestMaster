import styles from "../styles/CreateTest.module.css";

export default function OptionRow({
  opt,
  optIndex,
  qIndex,
  questionType,
  correctAnswer,
  correctAnswers,
  onOptionChange,
  onSingleCorrectChange,
  onCorrectAnswersChange,
  onRemoveOption,
}) {
  return (
    <div className={styles.optionRow}>
      <textarea
        placeholder={`Варіант ${optIndex + 1}`}
        value={opt}
        onChange={(e) => onOptionChange(qIndex, optIndex, e.target.value)}
        required
        className={styles.autoResize}
      />

      {questionType === "одна відповідь" && (
        <input
          type="radio"
          name={`correct-${qIndex}`}
          checked={correctAnswer === opt}
          onChange={() => onSingleCorrectChange(qIndex, opt)}
          className={styles.radioCorrect}
        />
      )}

      {questionType === "кілька відповідей" && (
        <label className={styles.correctCheckbox}>
          <input
            type="checkbox"
            checked={correctAnswers.includes(opt)}
            onChange={() => onCorrectAnswersChange(qIndex, optIndex)}
          />
        </label>
      )}

      <button
        type="button"
        className={styles.removeOptionBtn}
        onClick={() => onRemoveOption(qIndex, optIndex)}
      >
        ❌
      </button>
    </div>
  );
}
