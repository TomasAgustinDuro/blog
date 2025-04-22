import { NavLink } from "react-router";
import styles from "./navbar.module.css";
import logo from "../sources/logo.png";
import { FaLinkedin, FaSquareXTwitter } from "react-icons/fa6";

function Navbar() {
  return (
    <header className={styles.header}>
      {/* Logo */}
      <img src={logo} alt="Blog Logo" className={styles.headerImg} />

      {/* Contenido: nav + redes */}
      <div className={styles.content}>
        {/* Navegación */}
        <nav className={styles.navBar}>
          <NavLink to="/" className={styles.navLink}>
            Home
          </NavLink>
          <NavLink to="/post" className={styles.navLink}>
            Entradas
          </NavLink>
          <NavLink to="/about-me" className={styles.navLink}>
            About Me
          </NavLink>
        </nav>

        {/* Redes sociales */}
        <div className={styles.socialLinks}>
          <a
            href="https://www.linkedin.com/in/tomas-duro/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin className={styles.socialIcon} />
          </a>
          <a
            href="https://x.com/tommasdev"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaSquareXTwitter className={styles.socialIcon} />
          </a>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
