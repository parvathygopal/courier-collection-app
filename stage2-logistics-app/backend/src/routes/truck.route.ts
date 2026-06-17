import { Router } from "express";
import * as truckController from "../controllers/truck.controller.js";

const router = Router();

router.post("/", truckController.createTruck);
router.get("/", truckController.getTrucks);
router.post("/:truckId/bags/:bagId", truckController.assignBagToTruck);

export default router;
