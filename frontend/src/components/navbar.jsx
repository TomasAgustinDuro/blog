import { NavLink } from "react-router";
import styles from "./navbar.module.css";
import logo from "../sources/logo.png";


function Navbar() {
  return (
    <header>
      <img src={logo} alt="" className={styles.headerImg} />
      <nav className={styles.navBar}>
        <NavLink to="/" className="nav-link">
          Home
        </NavLink>
        <NavLink to="/post" className="nav-link">
          Entradas
        </NavLink>
        <NavLink to="/about-me" className="nav-link">
          About Me
        </NavLink>
      </nav>
    </header>
  );
}
export default Navbar;
