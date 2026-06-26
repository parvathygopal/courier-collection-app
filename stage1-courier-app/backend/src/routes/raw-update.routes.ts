import { Router } from "express";
import { createRawUpdates } from "../controllers/raw-update.controller";
import { validate } from "../middleware/validate";
import { verifyStage2Request } from "../middleware/verify-stage2-request";
import { rawUpdateBulkSchema } from "../validators/raw-update.validator";

const router = Router();

router.post(
  "/raw-updates",
  verifyStage2Request,
  validate(rawUpdateBulkSchema),
  createRawUpdates,
);

export default router;
