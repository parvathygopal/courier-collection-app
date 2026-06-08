// src/routes/package.routes.ts

import { Router } from "express";
import {
  create,
  getAll,
  getByTrackingId,
  getTrackingHistory,
  updatePackageStatus,
} from "../controllers/package.controller";
import { packageCreateSchema } from "../validators/package.validator";
import { validate } from "../middleware/validate";

const router = Router();

router.post("/", validate(packageCreateSchema), create);
router.get("/", getAll);
router.get("/:trackingId", getByTrackingId);
router.get("/:trackingId/tracking-history", getTrackingHistory);
router.patch("/:trackingId", updatePackageStatus);

export default router;
