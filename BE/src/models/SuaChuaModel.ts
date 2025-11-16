import mongoose from "mongoose";

const SuaChuaRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID người gửi yêu cầu
    userName: { type: String, required: true }, // Tên người thuê
    ma_phong: { type: String, required: true }, // Số phòng trọ
    issue: { type: String, required: true }, // Mô tả sự cố
    status: { 
      type: String, 
      enum: ["Chờ xử lý", "Đang xử lý", "Hoàn thành"], 
      default: "Chờ xử lý" 
    }, // Trạng thái yêu cầu
    approved: { 
      type: String, 
      enum: ["Chưa phê duyệt", "Đã phê duyệt"], 
      default: "Chưa phê duyệt" 
    }, // Trạng thái phê duyệt
  },
  { timestamps: true } // Tự động tạo createdAt & updatedAt
);

const SuachuaModel = mongoose.model("SuaChuaRequest", SuaChuaRequestSchema);

export default SuachuaModel;
