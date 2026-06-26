import { Router } from "express";
import * as packageController from "../controllers/package.controller.js";

const router = Router();

router.post("/", packageController.createPackage);
router.get("/", packageController.getPackages);
router.get("/:trackingId/history", packageController.getPackageHistory);
router.get("/:trackingId", packageController.getPackageByTrackingId);
router.patch("/:trackingId/status", packageController.updatePackageStatus);

export default router;
