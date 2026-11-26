import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { unauthorized } from "../lib/httpError.js";

const JWT_SECRET = env.JWT_SECRET;
const ADMIN_USER = env.ADMIN_USER;
const ADMIN_PASSWORD_HASH = env.ADMIN_PASSWORD;

// Mensaje único para no revelar si falló el usuario o la contraseña
const INVALID_CREDENTIALS_MESSAGE = "Usuario o contraseña incorrectos";

export class Login {
  static async loginUser(req, res, next) {
    const { user, password } = req.validated.body;

    try {
      // Se compara siempre el hash para no filtrar por tiempos de respuesta
      const isPasswordValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

      if (user !== ADMIN_USER || !isPasswordValid) {
        return next(unauthorized("INVALID_CREDENTIALS", INVALID_CREDENTIALS_MESSAGE));
      }

      const token = jwt.sign({ username: user }, JWT_SECRET, {
        expiresIn: "2h",
      });

      res.json({ token });
    } catch (error) {
      next(error);
    }
  }
}
