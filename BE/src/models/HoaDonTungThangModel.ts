import mongoose, { Schema } from "mongoose";

const HoaDonTungThangSchema = new Schema(
  {
    ma_hoa_don_thang: {
      type: String,
      required: false,
    },
    ma_phong: {
      type: String,
      required: true,
    },
    id_users: {
      type: String,
      required: true,
    },
    chi_so_dien_thang_nay: {
      type: Number,
      required: true,
    },
    chi_so_dien_thang_truoc: {
      type: Number,
      required: true,
    },
    so_dien_tieu_thu: {
      type: Number,
      required: true,
    },
    tien_dien: {
      type: Number,
      required: true,
    },
    tien_phong: {
      type: Number,
      required: true,
    },
    dich_vu: {
      type: Schema.Types.ObjectId,
      ref: "Dich_vu",
    }, // Tham chiếu đến DichVuModel
    electricity_data: [
      {
        type: Schema.Types.String,
        ref: "Electricity",
      },
    ], // Tham chiếu danh sách dữ liệu điện
    tong_tien: {
      type: Number,
      required: true,
    },
    trang_thai: {
      type: String,
      default: "chưa thanh toán",
    },
    ngay_tao_hoa_don: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const HoaDonTungThangModel = mongoose.model(
  "hoadontungthang",
  HoaDonTungThangSchema
);
export default HoaDonTungThangModel;
