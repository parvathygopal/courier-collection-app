// src/routes/public.routes.ts

import { Router } from "express";
import { getPublicPackageByTrackingId } from "../controllers/package.controller";
import { validateCaptchaToken } from "../middleware/captcha";

const router = Router();

router.get("/track/:trackingId", validateCaptchaToken, getPublicPackageByTrackingId);

export default router;
