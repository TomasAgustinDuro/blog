import express from "express";
import { Login } from "../middleware/auth.js";
import { validateSchema } from "../middleware/validate.js";
import { loginSchema } from "../schemas/authSchemas.js"

const router = express.Router();

router.post("/", validateSchema(loginSchema), Login.loginUser);

export default router;
