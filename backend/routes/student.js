// import express from "express";
// import { addStudent, getStudentDetails, updateStudent } from "../controllers/student.js";

// const router = express.Router();

// router.get("/:userid", getStudentDetails);
// router.post("/", addStudent)
// router.put("/:userid", updateStudent);

// export default router;


import express from "express";
import {
  addStudent,
  getStudentDetails,
  updateStudent,
} from "../controllers/student.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyToken, addStudent);
router.get("/:userid", verifyToken, getStudentDetails);
router.put("/:userid", verifyToken, updateStudent);

export default router;