import express from "express";
import postRoutes from "./routes/postRoutes.js"; // Asegúrate de que la ruta esté bien
import commentsRoutes from "./routes/commentRoutes.js";
import tagsRoutes from "./routes/tagsRoutes.js";
import postTagsRoutes from "./routes/postTagsRoutes.js";
import loginRoute from "./routes/loginRoute.js";
import {verifyToken} from './middleware/verifyToken.js'

import cors from "cors";

import { Post, Tags, PostTags } from "./models/index.js";

// Crear una instancia de Express
const app = express();
const port = 3000; // Puedes cambiar el puerto que desees

app.set("trust proxy", 1);

// Middleware para analizar el cuerpo de las solicitudes como JSON
app.use(
  cors({
    origin: [
      "http://localhost:5173", // dev local
      "https://blog-two-kappa-21.vercel.app", // producción
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json()); // Esto reemplaza body-parser

app.use("/login", loginRoute);

app.get("/me", verifyToken, (req, res) => {
  res.json(req.user);
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
