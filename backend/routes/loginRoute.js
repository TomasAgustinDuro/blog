import express from "express";
import { Login } from "../middleware/auth.js";
import { validateSchema } from "../middleware/validate.js";
import { authSchema } from "../schemas/authSchemas.js"

const router = express.Router();

router.post("/", validateSchema(authSchema), Login.loginUser);

export default router;
