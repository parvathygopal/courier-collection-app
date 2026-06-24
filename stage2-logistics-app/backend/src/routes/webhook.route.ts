import { Router } from "express";
import { verifyIntegration } from "../middlewares/verify-stage1-request.js";
import { createPackageFromStage1Webhook } from "../controllers/webhook.controller.js";

const router = Router();

router.post("/package", verifyIntegration, createPackageFromStage1Webhook);

export default router;
