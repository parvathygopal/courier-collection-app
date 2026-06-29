import { Router } from "express";
import {
  getLogisticsWebhookRegistration,
  putLogisticsWebhookRegistration,
} from "../controllers/integration.controller";
import { validate } from "../middleware/validate";
import { upsertLogisticsWebhookConfigSchema } from "../validators/integration.validator";

const router = Router();

router.get("/logistics-webhook", getLogisticsWebhookRegistration);
router.put(
  "/logistics-webhook",
  validate(upsertLogisticsWebhookConfigSchema),
  putLogisticsWebhookRegistration,
);

export default router;
