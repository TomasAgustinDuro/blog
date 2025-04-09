import express from "express";
import { Login } from "../middleware/auth.js";

const router = express.Router();

router.post("/", Login.loginUser);

export default router;
