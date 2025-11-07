import express from "express";
import {
  getStudents,
  updateStudent,
  deleteStudent,
  getRejectedStudents,
  freezeStudent,
  unfreezeStudent,
} from "../controllers/adminStudent.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", isAdmin, getStudents);
router.get("/rejected", isAdmin, getRejectedStudents);
router.put("/:userid", isAdmin, updateStudent);
router.delete("/:userid", isAdmin, deleteStudent);
router.put("/:userid/freeze", isAdmin, freezeStudent);
router.put("/:userid/unfreeze", isAdmin, unfreezeStudent);

export default router;
