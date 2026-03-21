import express from "express";
import { 
  getAllPlacements, 
  updatePlacementStatus, 
  deletePlacement, 
  uploadAdminOfferLetter // <--- Imported multer
} from "../controllers/adminPlacement.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", isAdmin, getAllPlacements);

// Added multer middleware here to parse the file before passing to the controller
router.put(
  "/:userId/:driveId", 
  isAdmin, 
  uploadAdminOfferLetter.single("offerletter_file_name"), 
  updatePlacementStatus
);

router.delete("/:userId/:driveId", isAdmin, deletePlacement);

export default router;