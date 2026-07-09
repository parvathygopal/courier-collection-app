import { Router } from "express";
import {
  getLogisticsWebhookRegistration,
  putLogisticsWebhookRegistration,
} from "../controllers/integration.controller";
import { validate } from "../middleware/validate";
import { verifyIntegrationAdmin } from "../middleware/verify-integration-admin";
import { upsertLogisticsWebhookConfigSchema } from "../validators/integration.validator";

const router = Router();

router.get("/logistics-webhook", verifyIntegrationAdmin, getLogisticsWebhookRegistration);
router.put(
  "/logistics-webhook",
  verifyIntegrationAdmin,
  validate(upsertLogisticsWebhookConfigSchema),
  putLogisticsWebhookRegistration,
);

export default router;
