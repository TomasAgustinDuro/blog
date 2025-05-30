import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config.js";

export const verifyToken = (req, res, next) => {
  try {
    console.log("🔑 Interceptando request en:", req.originalUrl);

    // 1. Verificar que el token exista
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Formato de token inválido" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token faltante" });
    }

    // 2. Verificar el token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("❌ Error verificando token:", err.message);
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token expirado" });
        }
        return res.status(403).json({ message: "Token inválido" });
      }

      console.log("✅ Token válido para usuario:", decoded.username);
      req.user = decoded;
      next(); // ¡Asegúrate de que siempre se llame!
    });
  } catch (error) {
    console.error("🔥 Error crítico en verifyToken:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
