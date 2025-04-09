import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const admin_user = process.env.ADMIN_USER;
const admin_password = process.env.ADMIN_PASSWORD;

export class Login {
  static async loginUser(req, res) {
    const { user, password } = req.body;

    try {
      if (user !== admin_user) {
        return res.status(401).json({ message: "Usuario incorrecto" });
      }

      const isPasswordValid = await bcrypt.compare(password, admin_password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }

      req.session.authenticated = true;
      req.session.user = { username: user };

      // Guardar explícitamente la sesión antes de responder
      req.session.save((err) => {
        if (err) {
          console.error("Error al guardar la sesión:", err);
          return res.status(500).json({ error: "Error al iniciar sesión" });
        }
        // Solo responde cuando la sesión se ha guardado correctamente
        return res.status(200).json("Sesión iniciada correctamente");
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
