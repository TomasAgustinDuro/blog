import { useState, useContext, useEffect } from "react";
import { useLoginUser } from "../../auth/auth";
import { AuthContext } from "../../auth/authContext";
import { useNavigate } from "react-router-dom";
import styles from "./login.module.css";

function Login() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  const { fetchUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const { mutate, isSuccess, isError, error } = useLoginUser(fetchUser);

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate({ user, password });
  };

  useEffect(() => {
    if (isSuccess) {
      navigate("/admin");
    }
  }, [isSuccess, navigate]);

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Admin Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className={styles.input}
          aria-label="Username"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          aria-label="Password"
        />
        <button type="submit" className={styles.button}>
          Sign In
        </button>

        {isError && <p className={styles.error}>{error.message}</p>}
      </form>
    </div>
  );
}

export default Login;
