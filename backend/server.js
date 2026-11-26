import { env } from "./config/env.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import postRoutes from "./routes/postRoutes.js";
import commentsRoutes from "./routes/commentRoutes.js";
import loginRoute from "./routes/loginRoute.js";
import imagesRoutes from "./routes/imagesRoutes.js";
import { verifyToken } from "./middleware/verifyToken.js";
import { errorHandler, routeNotFoundHandler } from "./middleware/errorHandler.js";

const app = express();

const port = env.PORT;

app.set("trust proxy", 1);

app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(helmet());

// Cuerpos JSON de hasta 1 MB (el error 413 se traduce en errorHandler)
app.use(express.json({ limit: "1mb" }));

app.use("/login", loginRoute);

app.get("/me", verifyToken, (req, res) => {
  res.json(req.user);
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use("/posts", postRoutes);
app.use("/comments", commentsRoutes);
app.use("/images", imagesRoutes);

// Debe ir después de todas las rutas: rutas inexistentes y manejo de errores
app.use(routeNotFoundHandler);
app.use(errorHandler);

const init = async () => {
  try {
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error.message);
  }
};

init();
