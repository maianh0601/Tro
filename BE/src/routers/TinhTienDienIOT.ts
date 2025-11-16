import express from "express";
import { receiveElectricityData } from "../controllers/electricityController";

const router = express.Router();

// Route nhận dữ liệu từ ESP32
router.post("/electricity", receiveElectricityData);

export default router;
