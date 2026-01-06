import OptionRow from "./OptionRow";
import MatchingRow from "./MatchingRow";
import styles from "../styles/CreateTest.module.css";

export default function QuestionBlock({
  q,
  qIndex,
  onQuestionChange,
  onQuestionTypeChange,
  onOptionChange,
  onSingleCorrectChange,
  onCorrectAnswersChange,
  onRemoveOption,
  onAddOption,
  onAddMatchingPair,
  onRemoveMatchingPair,
  onRemoveQuestion,
  onChangeMatchingKey,
  onChangeMatchingValue,
  autoResize,
}) {
  return (
    <div className={styles.questionBlock}>
      <textarea
        placeholder={`Питання ${qIndex + 1}`}
        value={q.questionText}
        onChange={(e) => onQuestionChange(qIndex, "questionText", e.target.value)}
        onInput={autoResize}
        required
        className={styles.autoResize}
      />

      <select
        value={q.questionType}
        onChange={(e) => onQuestionTypeChange(qIndex, e.target.value)}
      >
        <option value="одна відповідь">одна відповідь</option>
        <option value="кілька відповідей">кілька відповідей</option>
        <option value="співставлення">співставлення</option>
      </select>

      <div className={styles.scoreContainer}>
        <label>Бали за питання:</label>
        <input
          type="number"
          min="1"
          value={q.score || 1}
          onChange={(e) => onQuestionChange(qIndex, "score", Number(e.target.value))}
          className={styles.scoreInput}
          required
        />
      </div>

      {q.questionType !== "співставлення" &&
        q.options.map((opt, optIndex) => (
          <OptionRow
            key={optIndex}
            opt={opt}
            optIndex={optIndex}
            qIndex={qIndex}
            questionType={q.questionType}
            correctAnswer={q.correctAnswer}
            correctAnswers={q.correctAnswers}
            onOptionChange={onOptionChange}
            onSingleCorrectChange={onSingleCorrectChange}
            onCorrectAnswersChange={onCorrectAnswersChange}
            onRemoveOption={onRemoveOption}
          />
        ))}

      {q.questionType !== "співставлення" && (
        <button
          type="button"
          className={styles.addOptionBtn}
          onClick={() => onAddOption(qIndex)}
        >
          ➕ Додати варіант
        </button>
      )}

      {q.questionType === "співставлення" &&
        q.options.map((opt, optIndex) => (
          <MatchingRow
            key={optIndex}
            opt={opt}
            optIndex={optIndex}
            qIndex={qIndex}
            onChangeKey={onChangeMatchingKey}
            onChangeValue={onChangeMatchingValue}
            onRemove={onRemoveMatchingPair}
          />
        ))}

      {q.questionType === "співставлення" && (
        <button
          type="button"
          className={styles.addOptionBtn}
          onClick={() => onAddMatchingPair(qIndex)}
        >
          ➕ Додати ключ–відповідь
        </button>
      )}

      <button
        type="button"
        className={styles.removeQuestionBtn}
        onClick={() => onRemoveQuestion(qIndex)}
      >
        🗑 Видалити питання
      </button>
    </div>
  );
}
