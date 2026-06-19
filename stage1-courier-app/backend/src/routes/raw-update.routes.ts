import { Router } from "express";
import { createRawUpdates } from "../controllers/raw-update.controller";
import { validate } from "../middleware/validate";
import { rawUpdateBulkSchema } from "../validators/raw-update.validator";

const router = Router();

router.post("/raw-updates", validate(rawUpdateBulkSchema), createRawUpdates);

export default router;
