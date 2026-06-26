import { Router } from "express";
import * as bagController from "../controllers/bag.controller.js";

const router = Router();

router.post("/", bagController.createBag);
router.get("/", bagController.getBags);
router.post("/:bagId/packages/:packageId", bagController.assignPackageToBag);

export default router;
