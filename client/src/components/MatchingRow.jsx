import styles from "../styles/CreateTest.module.css";

export default function MatchingRow({
  opt,
  optIndex,
  qIndex,
  onChangeKey,
  onChangeValue,
  onRemove,
}) {
  return (
    <div className={styles.matchingRow}>
      <input
        type="text"
        placeholder={`Ключ ${optIndex + 1}`}
        value={opt.key || ""}
        onChange={(e) => onChangeKey(qIndex, optIndex, e.target.value)}
        required
      />
      <input
        type="text"
        placeholder={`Відповідь ${optIndex + 1}`}
        value={opt.value || ""}
        onChange={(e) => onChangeValue(qIndex, optIndex, e.target.value)}
        required
      />
      <button
        type="button"
        className={styles.removeOptionBtn}
        onClick={() => onRemove(qIndex, optIndex)}
      >
        ❌
      </button>
    </div>
  );
}
