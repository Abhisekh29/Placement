import express from "express";
import {
  getPlacementDrives,
  addPlacementDrive,
  updatePlacementDrive,
  deletePlacementDrive,
  toggleDriveStatus,
  uploadJD,
} from "../controllers/placementDrive.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", isAdmin, getPlacementDrives);
router.post("/", isAdmin, uploadJD.single("jd_file"), addPlacementDrive);
router.put("/:driveId", isAdmin, uploadJD.single("jd_file"), updatePlacementDrive);
router.delete("/:driveId", isAdmin, deletePlacementDrive);
router.put("/status/:driveId", isAdmin, toggleDriveStatus); // New route for status toggle

export default router;