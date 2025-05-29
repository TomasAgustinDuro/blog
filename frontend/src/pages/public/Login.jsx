import React, { useState, useContext, useEffect } from "react";
import { useLoginUser } from "../../auth/auth";
import { AuthContext } from "../../auth/authContext";
import { useNavigate } from "react-router-dom";
import styles from "./login.module.css";

function Login() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  const { fetchUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const { mutate, isSuccess, isError, error, data } = useLoginUser(fetchUser);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newUser = { user, password };

    mutate(newUser, {
      onSuccess: async (data) => {
        localStorage.setItem("token", data.token);
        await fetchUser(); // ahora sí el token está presente
        navigate("/admin");
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={user}
        onChange={(e) => setUser(e.target.value)}
        className={styles.input}
      />
      <input
        placeholder="Password"
        value={password}
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        className={styles.textarea}
      />
      <button type="submit" className={styles.button}>
        Login
      </button>

      {isError && <div>Error: {error.message}</div>}
      {isSuccess && <div>¡Login exitoso! Bienvenido {data.username}</div>}
    </form>
  );
}

export default Login;
