import express from "express";
import postRoutes from "./routes/postRoutes.js"; // Asegúrate de que la ruta esté bien
import commentsRoutes from "./routes/commentRoutes.js";
import loginRoute from "./routes/loginRoute.js";
import { verifyToken } from "./middleware/verifyToken.js";
import imagesRoutes from "./routes/imagesRoutes.js";
import dotenv from "dotenv";
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import { errorHandler } from "./middleware/errorHandler.js";

import cors from "cors";

// Crear una instancia de Express
const app = express();

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

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

app.use(helmet())

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many login attempts, try again later" },
}
)

app.use(express.json({limit: "1mb"})); 

app.use("/login", loginLimiter, loginRoute);

app.get("/me", verifyToken, (req, res) => {
  res.json(req.user);
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Usar las rutas de posts
app.use("/post", postRoutes);
app.use("/comments", commentsRoutes);
app.use("/images", imagesRoutes);
// 🔁 Función principal
const init = async () => {
  try {
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`); // Más claro
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error.message);
  }
};

app.use(errorHandler);

init();

