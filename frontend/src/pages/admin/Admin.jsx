import { Outlet, NavLink } from "react-router-dom";
import styles from "./admin.module.css"; 

function Admin() {
  return (
    <section className={styles.admin}>
      <h2>Panel de administración</h2>

      <nav className={styles.navButtons}>
        <NavLink to="create">
          <button>Nueva entrada</button>
        </NavLink>

        <NavLink to="post">
          <button>Gestionar entradas</button>
        </NavLink>

        <NavLink to="stats">
          <button>Estadísticas</button>
        </NavLink>

        <NavLink to="comments">
          <button>Gestionar comentarios</button>
        </NavLink>
      </nav>

      <div className={styles.outletContainer}>
        <Outlet />
      </div>
    </section>
  );
}
export default Admin;
