import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const JWT_SECRET = env.JWT_SECRET;
const ADMIN_USER = env.ADMIN_USER;
const admin_password = env.ADMIN_PASSWORD;

// Mensaje único para no revelar si falló el usuario o la contraseña
const INVALID_CREDENTIALS_MESSAGE = "Credenciales inválidas";

export class Login {
  static async loginUser(req, res) {
    const { user, password } = req.body;

    try {
      // Se compara siempre el hash para no filtrar por tiempos de respuesta
      const isPasswordValid = await bcrypt.compare(password, admin_password);

      if (user !== ADMIN_USER || !isPasswordValid) {
        return res.status(401).json({ message: INVALID_CREDENTIALS_MESSAGE });
      }

      const token = jwt.sign({ username: user }, JWT_SECRET, {
        expiresIn: "2h",
      });

      res.json({ token });
    } catch (error) {
      console.error("Error al hacer login:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
