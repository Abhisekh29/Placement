import express from "express";
import {
  addStudent,
  getStudentDetails,
  updateStudent,
  getStudentsList,
} from "../controllers/student.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// General Routes
router.post("/", verifyToken, addStudent);
router.get("/:userid", verifyToken, getStudentDetails);
router.put("/:userid", verifyToken, updateStudent);

// New route for admin to get all students
router.get("/list/all", isAdmin, getStudentsList);

export default router;