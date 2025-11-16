/** @format */

import mongoose, { Schema } from 'mongoose';

const ChiSoDongHoScheme = new Schema(
    {
        ma_phong: {
            type: String,
            required: true,
        },
        id_users: {
            type: String,
            required: true,
        },
        ngay_thang_nam: {
            type: Date,
            required: true,
        },
        chi_so_dien: {
            type: Number,
            required: true,
            min:0,
        },
        image_dong_ho_dien: {
            type: String,
            required: true,
        },

    },
    { timestamps: true }
);

const ChiSoDongHoModel = mongoose.model('chisodongho', ChiSoDongHoScheme);
export default ChiSoDongHoModel;
