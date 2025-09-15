import express from "express";
import { getSessions } from "../controllers/session.js";

const router = express.Router();

router.get("/", getSessions);

export default router;