import express from "express";
import {
  getStudents,
  updateStudent,
  deleteStudent,
  getRejectedStudents,
} from "../controllers/adminStudent.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", isAdmin, getStudents);
router.get("/rejected", isAdmin, getRejectedStudents); // <-- NEW ROUTE
router.put("/:userid", isAdmin, updateStudent);
router.delete("/:userid", isAdmin, deleteStudent);

export default router;
