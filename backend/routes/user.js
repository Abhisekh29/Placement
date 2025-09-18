import express from "express";
import { getPendingUsers, updateUserStatus } from "../controllers/user.js";

const router = express.Router();

router.get("/pending", getPendingUsers);
router.put("/:userId/status", updateUserStatus);

export default router;