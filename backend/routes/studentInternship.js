import express from "express";
import {
  getStudentInternships,
  addStudentInternship,
  updateStudentInternship,
  deleteStudentInternship,
  upload,
} from "../controllers/studentInternship.js";
import { isStudent } from "../middleware/auth.js"; // Use isStudent, NOT isAdmin

const router = express.Router();

// All routes are protected by isStudent, which adds req.user
router.get("/", isStudent, getStudentInternships);
router.post("/", isStudent, upload.single("certificate"), addStudentInternship);
router.put("/:internshipId", isStudent, upload.single("certificate"), updateStudentInternship);
router.delete("/:internshipId", isStudent, deleteStudentInternship);

export default router;