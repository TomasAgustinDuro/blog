import express from "express";
import postRoutes from "./routes/postRoutes.js"; // Asegúrate de que la ruta esté bien
import commentsRoutes from "./routes/commentRoutes.js";
import tagsRoutes from "./routes/tagsRoutes.js";
import postTagsRoutes from "./routes/postTagsRoutes.js";
import loginRoute from "./routes/loginRoute.js";
import { verifyToken } from "./middleware/verifyToken.js";
import imagesRoutes from "./routes/imagesRoutes.js";
import sequelize from "./config/database.js";
import dotenv from "dotenv";
import cron from "node-cron";
import axios from "axios";

// Ping cada 5 minutos

import cors from "cors";

import { Post, Tags, PostTags } from "./models/index.js";

// Crear una instancia de Express
const app = express();

dotenv.config();

const port = process.env.PORT || 3000; // ✅ Sin fallback a 3000 (Render siempre inyecta el puerto)

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

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Usar las rutas de posts
app.use("/post", postRoutes);
app.use("/comments", commentsRoutes);
app.use("/tags", tagsRoutes);
app.use("/postTags", postTagsRoutes);
app.use("/images", imagesRoutes);
// 🔁 Función principal
const init = async () => {
  try {
    console.log("✅ Base de datos sincronizada (force: true)");

    sequelize
      .authenticate()
      .then(() => console.log("✅ DB CONECTADA"))
      .catch((err) => console.error("❌ ERROR DB:", err));

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`); // Más claro
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error.message);
  }
};

init();
