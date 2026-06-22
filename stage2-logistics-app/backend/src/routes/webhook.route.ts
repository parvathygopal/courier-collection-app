import { Router } from "express";
import { createPackageFromStage1Webhook } from "../controllers/webhook.controller.js";

const router = Router();

router.post("/package", createPackageFromStage1Webhook);

export default router;
