/** @format */

import mongoose, { Schema } from 'mongoose';

const PhongTroScheme = new Schema(
    {
        ma_phong: {
            type: String,
            required: true,
        },
        ma_map: {
            type: String,
            required: false,
        },
        ma_danh_muc: {
            type: String,
            required: true,
        },
        id_users: {
            type: String,
            required: false,
        },
        id_chu_tro: {
            type: String,
            required: false,
        },
        ten_phong_tro: {
            type: String,
            required: true,
        },
        dia_chi: {
            type: String,
            required: false,
        },
        anh_phong: {
			type: String,
			require: false
		},
        mo_ta: {
            type: String,
            required: false,
        },
        dien_tich: {
            type: String,
            required: false,
        },
        gia_tien: {
            type: Number,
            default: 1,
        },
        trang_thai: {
            type: Number,
            required: true,
        },
        so_luong_nguoi: {
            type: Number,
            default: 1,
        },
    },
    { timestamps: true }
);

const PhongTroModel = mongoose.model('phongtro', PhongTroScheme);
export default PhongTroModel;
