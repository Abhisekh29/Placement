import express from "express";
import { addStudent, getStudentDetails } from "../controllers/student.js";

const router = express.Router();

router.get("/:userid", getStudentDetails);
router.post("/", addStudent)

export default router;