import mongoose, { Schema, Document } from "mongoose";

// Định nghĩa interface cho dữ liệu điện
export interface IElectricity extends Document {
  room_id: string;
  user_id?: string | null;
  voltage: number;
  current: number;
  power: number;
  power_factor: number;
  frequency: number;
  energy: number;
  total_cost: number;
  timestamp: Date;
}

// Định nghĩa schema cho Mongoose
const ElectricitySchema: Schema = new Schema({
  room_id: { type: String, required: true },
  user_id: { type: String, required: false },
  voltage: { type: Number, required: true },
  current: { type: Number, required: true },
  power: { type: Number, required: true },
  power_factor: { type: Number, required: true },
  frequency: { type: Number, required: true },
  energy: { type: Number, required: true },
  total_cost: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Xuất model để sử dụng
export default mongoose.model<IElectricity>("Electricity", ElectricitySchema);
