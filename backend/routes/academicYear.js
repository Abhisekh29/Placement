import express from "express";
import { getAcademicYears, addAcademicYear, deleteAcademicYear, updateAcademicYear, } from "../controllers/academicYear.js";

const router = express.Router();

router.get("/", getAcademicYears);
router.post("/", addAcademicYear);
router.put("/:yearId", updateAcademicYear);
router.delete("/:yearId", deleteAcademicYear);

export default router;
