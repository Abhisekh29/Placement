import express from "express";
import { getProgram, getPrograms } from "../controllers/program.js";

const router = express.Router();

// Get all programs
router.get("/", getPrograms);

// Get a single program by ID
router.get("/:program_id", getProgram);

export default router;