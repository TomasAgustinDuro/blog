import express from "express";
import { Login } from "../middleware/auth.js";

const router = express.Router();

router.post("/", console.log("Solicitud de login recibida"), Login.loginUser);

export default router;
