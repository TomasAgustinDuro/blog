import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from "../config/config.js";


dotenv.config();

const ADMIN_USER = process.env.ADMIN_USER;
const admin_password = process.env.ADMIN_PASSWORD;

export class Login {
  static async loginUser(req, res) {
    const { user, password } = req.body;

    try {
      if (user !== ADMIN_USER) {
        return res.status(401).json({ message: "Usuario incorrecto" });
      }

      const isPasswordValid = await bcrypt.compare(password, admin_password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }

      const token = jwt.sign({ username: user }, JWT_SECRET, {
        expiresIn: "2h",
      });

      res.json({ token });
    } catch (error) {
      console.error("Error al hacer login:", error);
      return res.status(500).json({ error: error.message });
    }
  }
}
