import { ObjectId } from 'mongodb';
import mongoose, { Schema } from "mongoose";

const DanhGiaSchema = new Schema(
  {
    ma_phong: {
      type: String,
      require: true
    },
    id_user: {
      type: ObjectId,
      require: true
    },
    repcomment: {
      type: ObjectId,
      default: null
    },
    noi_dung: {
      type: String,
      require: false
    },
    danh_gia_sao: {
      type: Number,
      min: 0,
      max: 5,
      required: false, // Có thể có hoặc không
      default: null
    }
  },
  { timestamps: true }
);

const DanhGiaModel = mongoose.model("danh_gia", DanhGiaSchema);
export default DanhGiaModel;
