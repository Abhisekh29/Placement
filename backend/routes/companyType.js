import express from "express";
import {
  getCompanyTypes,
  addCompanyType,
  updateCompanyType,
  deleteCompanyType,
} from "../controllers/companyType.js";

const router = express.Router();

router.get("/", getCompanyTypes);
router.post("/", addCompanyType);
router.put("/:typeId", updateCompanyType);
router.delete("/:typeId", deleteCompanyType);

export default router;