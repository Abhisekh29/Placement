import express from "express";
import {
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.js";

const router = express.Router();

router.get("/", getDepartments);
router.post("/", addDepartment);
router.put("/:departmentId", updateDepartment);
router.delete("/:departmentId", deleteDepartment);

export default router;