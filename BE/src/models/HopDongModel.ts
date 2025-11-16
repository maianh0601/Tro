/** @format */

import mongoose, { Schema } from 'mongoose';

const HopDongScheme = new Schema(
    {
        ten_hop_dong: {
            type: String,
            default: "Hợp đồng thuê phòng"
        },
        ma_phong: {
            type: String,
            required: true,
        },
        id_users: {
            type: String,
            required: true,
        },
        start_date: {
            type: Date,
            required: true,
        },
        end_date: {
            type: Date,
            required: true,
        },
        tien_coc: {
            type: Number,
            default: 1,
        },
        trang_thai: {
            type: String,
            enum: [ "chua_ky", "da_ky", "het_han", "yeu_cau_huy_hop_dong" ],
            default: "da_ky",
            required: true,
        },
        file_hop_dong: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const HopDongModel = mongoose.model('hopdong', HopDongScheme);
export default HopDongModel;
