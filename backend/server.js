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

app.set("trust proxy", 1);

// Middleware para analizar el cuerpo de las solicitudes como JSON
app.use(
  cors({
    origin: ["https://blog-two-kappa-21.vercel.app", "http://localhost:5173"], // Incluye tu entorno de desarrollo
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json()); // Esto reemplaza body-parser

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://blog-two-kappa-21.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secreto",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // Mantén true en producción con HTTPS
      httpOnly: true,
      sameSite: "none", // Importante para peticiones cross-origin
      maxAge: 1000 * 60 * 60 * 24 // 1 día en milisegundos
    },
  })
);

app.use("/login", loginRoute);

app.get("/me", (req, res) => {
  console.log(req.session);
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
