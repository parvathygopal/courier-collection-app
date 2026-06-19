import { Router } from "express";
import * as regionController from "../controllers/region.controller.js";

const router = Router();

router.get("/", regionController.getRegions);

export default router;
