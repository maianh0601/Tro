/** @format */

import mongoose, { Schema } from "mongoose";

const HinhAnhPhongScheme = new Schema(
  {
    ma_phong: {
      type: String,
      require: true,
    },

    image_url: {
      type: String,
      require: false,
    },
  },
  { timestamps: true }
);

const HinhAnhPhongModel = mongoose.model("hinh_anh_phongs", HinhAnhPhongScheme);
export default HinhAnhPhongModel;
