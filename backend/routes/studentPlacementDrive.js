import express from "express";
import {
  getActiveDrives, 
  getDriveDetails, 
} from "../controllers/studentPlacementDrive.js";
import { isStudent } from "../middleware/auth.js"; 

const router = express.Router();

// --- Student Routes ---
router.get("/active", isStudent, getActiveDrives);
router.get("/details/:driveId", isStudent, getDriveDetails);

export default router;