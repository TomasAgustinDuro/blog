import styles from "./pagination.module.css";

function Pagination({ totalPages, currentPage, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={styles.paginationContainer}>
      <button
        className={styles.navButton}
        onClick={() => {
          if (currentPage === 1) return;
          onPageChange(currentPage - 1);
        }}
      >
        Anterior
      </button>

      <div>
        {pages.map((page) => (
          <button
            key={page}
            className={`${styles.page} ${
              page === currentPage ? styles.active : ""
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        className={styles.navButton}
        onClick={() => {
          if (currentPage === totalPages) return;
          onPageChange(currentPage + 1);
        }}
      >
        Siguiente
      </button>
    </div>
  );
}

export default Pagination