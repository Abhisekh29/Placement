import express from "express";
import {
  applyForDrive,
  getAppliedDrives,
  getMyPlacements,
  updateMyPlacement,
  uploadOfferLetter, // 1. Import the upload middleware
} from "../controllers/studentPlacement.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/apply", verifyToken, applyForDrive);
router.get("/applied-drives", verifyToken, getAppliedDrives);
router.get("/my-placements", verifyToken, getMyPlacements);

// 2. Add the middleware to the PUT route
router.put(
  "/my-placements/:driveId", 
  verifyToken, 
  uploadOfferLetter.single("offerletter_file_name"), // Handles the file
  updateMyPlacement
);

export default router;