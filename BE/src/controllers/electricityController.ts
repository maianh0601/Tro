import { Request, Response } from "express";
import Electricity, { IElectricity } from "../models/Electricity";
import moment from "moment";

// Bộ nhớ tạm để lưu dữ liệu cuối ngày
let latestData: Record<string, IElectricity> = {};

// Ngưỡng năng lượng tiêu thụ quy định (Wh)
const ENERGY_LIMIT = 100; // Bạn có thể thay đổi giá trị này nếu cần

// Nhận dữ liệu từ ESP32
export const receiveElectricityData = (req: Request, res: Response): void => {
  const { room_id, voltage, power, power_factor, frequency, energy, current } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!room_id || voltage === undefined || current === undefined || power === undefined) {
    res.status(400).json({ message: "Thiếu thông tin dữ liệu!" });
    return;
  }

  // Xử lý nếu giá trị bị lỗi (NaN)
  const safeVoltage = isNaN(voltage) ? 0 : voltage;
  const safeCurrent = isNaN(current) ? 0 : current;
  const safePower = isNaN(power) ? 0 : power;
  const safePowerFactor = isNaN(power_factor) ? 0 : power_factor;
  const safeFrequency = isNaN(frequency) ? 0 : frequency;
  const safeEnergy = isNaN(energy) ? 0 : energy;

  // Tính tiền điện (3000đ/kWh)
  const electricityPrice = 3000;
  const total_cost = (safeEnergy / 1000) * electricityPrice;

  // Kiểm tra năng lượng tiêu thụ vượt mức quy định
  if (safeEnergy > ENERGY_LIMIT) {
    console.log(`CẢNH BÁO: Phòng ${room_id} - Năng lượng tiêu thụ vượt mức quy định (${ENERGY_LIMIT}Wh)!`);
    console.log(`- Năng lượng hiện tại: ${safeEnergy.toFixed(10)}Wh`);
  }

  // Cập nhật dữ liệu vào bộ nhớ tạm
  latestData[room_id] = {
    room_id,
    voltage: safeVoltage,
    current: safeCurrent,
    power: safePower,
    power_factor: safePowerFactor,
    frequency: safeFrequency,
    energy: safeEnergy,
    total_cost,
    timestamp: new Date(),
  } as IElectricity;

  // In thông tin nhận được
  console.log(`Nhận dữ liệu từ phòng ${room_id}:`);
  console.log(`- Điện áp (Voltage): ${safeVoltage}V`);
  console.log(`- Dòng điện (Current): ${safeCurrent}A`);
  console.log(`- Công suất (Power): ${safePower}W`);
  console.log(`- Hệ số công suất (Power Factor): ${safePowerFactor}`);
  console.log(`- Tần số (Frequency): ${safeFrequency}Hz`);
  console.log(`- Năng lượng tiêu thụ (Energy): ${safeEnergy}Wh`);
  console.log(`- Tổng chi phí (Total Cost): ${total_cost.toFixed(2)}đ`);

  res.json({ message: "Dữ liệu đã nhận!" });
};

// Hàm lưu dữ liệu vào cuối ngày
export const saveEndOfDayData = async (): Promise<void> => {
  const now = moment().format("YYYY-MM-DD HH:mm:ss");
  console.log(`Lưu dữ liệu vào lúc: ${now}`);

  try {
    for (const room_id in latestData) {
      const data = latestData[room_id];
      const newRecord = new Electricity(data);
      await newRecord.save();
      console.log(`Dữ liệu phòng ${room_id} đã lưu vào database.`);
    }

    // Xóa bộ nhớ tạm để chuẩn bị cho lần tiếp theo
    latestData = {};
  } catch (error) {
    console.error("Lỗi khi lưu dữ liệu:", error);
  }
}