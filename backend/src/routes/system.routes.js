import { Router } from "express";
import { getHealth, getReadiness } from "../controllers/system.controller.js";

const router = Router();

router.get("/health", getHealth);
router.get("/ready", getReadiness);

export default router;
