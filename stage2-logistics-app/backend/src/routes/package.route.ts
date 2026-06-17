import { Router } from "express";
import * as packageController from "../controllers/package.controller.js";

const router = Router();

router.post("/", packageController.createPackage);
router.get("/", packageController.getPackages);

export default router;
