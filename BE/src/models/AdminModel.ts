import mongoose, { Schema } from "mongoose";
import { UserVerifyStatus } from "../constants/enum";

const AdminSchema = new Schema(
  {
    id_quyen: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    ho_va_ten: {
      type: String,
      required: true,
    },
    ngay_sinh: {
      type: Date,
      required: true,
    },
    verify: {
      type: String,
      enum: Object.values(UserVerifyStatus),
      default: UserVerifyStatus.Verified,
    },
    que_quan: {
      type: String,
      default: "Không rõ",
    },
    so_dien_thoai: {
      type: String,
      required: true,
    },
    gioi_tinh: {
      type: String,
      default: "Nam",
    },
    cccd: {
      type: String,
      required: true,
    },
    is_block: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const AdminModel = mongoose.model("admins", AdminSchema);
export default AdminModel;
