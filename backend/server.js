import express from "express";
import session from "express-session";
import postRoutes from "./routes/postRoutes.js"; // Asegúrate de que la ruta esté bien
import commentsRoutes from "./routes/commentRoutes.js";
import tagsRoutes from "./routes/tagsRoutes.js";
import postTagsRoutes from "./routes/postTagsRoutes.js";
import loginRoute from "./routes/loginRoute.js";

import cors from "cors";

import { Post, Tags, PostTags } from "./models/index.js";

// Crear una instancia de Express
const app = express();
const port = 3000; // Puedes cambiar el puerto que desees

// Middleware para analizar el cuerpo de las solicitudes como JSON
app.use(
  cors({
    origin: "http://localhost:5173", // URL del frontend
    credentials: true,
  })
);
app.use(express.json()); // Esto reemplaza body-parser

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secreto",
    resave: false,
    saveUninitialized: false, // mejor false
    cookie: {
      secure: false, // true en producción con HTTPS
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use("/login", loginRoute);

app.get("/me", (req, res) => {
  if (req.session.user) {
    console.log(req.session.user);
    res.json(req.session.user);
  } else {
    res.status(401).json({ message: "No logueado" });
  }
});

// Usar las rutas de posts
app.use("/post", postRoutes);
app.use("/comments", commentsRoutes);
app.use("/tags", tagsRoutes);
app.use("/postTags", postTagsRoutes);

// Levantar el servidor
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
