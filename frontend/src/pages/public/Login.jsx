import React, { useState } from "react";
import { useLoginUser } from "../../auth/auth";
import styles from './login.module.css'

function Login() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  const { mutate, isSuccess, isError, error, data } = useLoginUser()

  const handleSubmit = (e) => {
    e.preventDefault();

    // Creamos el nuevo post
    const newUser = { user, password };

    console.log("Enviando post: ", newUser);

    // Ejecutamos la mutación con el post
    mutate(newUser);
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

      {/* Mostrar error si ocurre */}
      {isError && <div>Error: {error.message}</div>}

      {/* Mensaje cuando el post se crea con éxito */}
      {isSuccess && isSuccess.message}
    </form>
  );
}

export default Login;
