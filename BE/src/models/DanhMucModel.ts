import mongoose, { Schema } from "mongoose";

const DanhMucScheme = new Schema(

	{
		ma_danh_muc : {
			type : String,
			require: true
		},
		
		ten_danh_muc : {
			type : String,
			require: true
		},


    trang_thai: {
      type: Number,
      require: true,
    },

    mo_ta: {
      type: String,
      require: false,
      maxlength: 1000, // Giới hạn tối đa 1000 ký tự, hoặc bỏ nếu không cần
    },
  },
  { timestamps: true }
);

const DanhMucModel = mongoose.model("danh_mucs", DanhMucScheme);
export default DanhMucModel;
