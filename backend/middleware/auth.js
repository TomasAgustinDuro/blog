import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_USER = process.env.ADMIN_USER;
const admin_password = process.env.ADMIN_PASSWORD;

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
