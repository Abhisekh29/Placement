import express from "express";
import {
  getActiveDrives, 
  getDriveDetails, 
} from "../controllers/studentPlacementDrive.js";
import { verifyToken } from "../middleware/auth.js"; 

// 1. You were missing these two lines
const router = express.Router();

// --- Student Routes ---
router.get("/active", verifyToken, getActiveDrives);
router.get("/details/:driveId", verifyToken, getDriveDetails);

export default router;