import styles from "./spinner.module.css";

function Spinner() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading">
      <span className={styles.spinner}></span>
    </div>
  );
}

export default Spinner;
