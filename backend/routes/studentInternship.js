import express from "express";
import {
  getStudentInternships,
  addStudentInternship,
  updateStudentInternship,
  deleteStudentInternship,
  upload,
} from "../controllers/studentInternship.js";
import { verifyToken } from "../middleware/auth.js"; // Use verifyToken, NOT isAdmin

const router = express.Router();

// All routes are protected by verifyToken, which adds req.user
router.get("/", verifyToken, getStudentInternships);
router.post("/", verifyToken, upload.single("certificate"), addStudentInternship);
router.put("/:internshipId", verifyToken, upload.single("certificate"), updateStudentInternship);
router.delete("/:internshipId", verifyToken, deleteStudentInternship);

export default router;