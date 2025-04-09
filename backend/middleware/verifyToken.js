import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token faltante" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Error verificando token:", err); // 👈 y esto
      return res.status(403).json({ message: "Token inválido" });
    }
    req.user = user;
    next();
  });
};


