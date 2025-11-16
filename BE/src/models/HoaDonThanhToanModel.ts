/** @format */

import mongoose, { Schema } from 'mongoose';

const HoaDonThanhToanScheme = new Schema(
    {
        ma_phong: {
            type: String,
            required: false,
        },
        id_users: {
            type: String,
            required: true,
        },
        so_tien: {
            type: Number,
            required: true,
        },
        noi_dung: {
            type: String,
            required: false,
        },
        trang_thai: {
            type: String,
            required: true,
        },
        ma_don_hang: {
            type: String,
            required: false,
        },
        ngay_chuyen_khoan: {
            type: Date,
            required: true,
        },

        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const HoaDonThanhToanModel = mongoose.model('hoadonthanhtoan', HoaDonThanhToanScheme);
export default HoaDonThanhToanModel;
