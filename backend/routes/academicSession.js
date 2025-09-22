import express from "express";
import {
  getAcademicSessions,
  addAcademicSession,
  updateAcademicSession,
  deleteAcademicSession,
} from "../controllers/academicSession.js";

const router = express.Router();

router.get("/", getAcademicSessions);
router.post("/", addAcademicSession);
router.put("/:sessionId", updateAcademicSession);
router.delete("/:sessionId", deleteAcademicSession);

export default router;