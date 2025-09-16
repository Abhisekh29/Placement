import express from "express";
import { addStudent, getStudentDetails, updateStudent } from "../controllers/student.js";

const router = express.Router();

router.get("/:userid", getStudentDetails);
router.post("/", addStudent)
router.put("/:userid", updateStudent);

export default router;