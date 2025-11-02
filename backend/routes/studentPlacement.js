import express from "express";
import {
  applyForDrive,
  getAppliedDrives,
  getMyPlacements,
  updateMyPlacement,
  uploadOfferLetter,
} from "../controllers/studentPlacement.js";
import { isStudent } from "../middleware/auth.js";

const router = express.Router();

router.post("/apply", isStudent, applyForDrive);
router.get("/applied-drives", isStudent, getAppliedDrives);
router.get("/my-placements", isStudent, getMyPlacements);

router.put(
  "/my-placements/:driveId", 
  isStudent, 
  uploadOfferLetter.single("offerletter_file_name"), // Handles the file
  updateMyPlacement
);

export default router;