import express from "express";
import {
  getInternships,
  addInternship,
  updateInternship,
  deleteInternship,
  upload,
} from "../controllers/internship.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyToken, getInternships);
router.post("/", verifyToken, upload.single("certificate"), addInternship);
router.put("/:internshipId", verifyToken, upload.single("certificate"), updateInternship);
router.delete("/:internshipId", verifyToken, deleteInternship);

export default router;