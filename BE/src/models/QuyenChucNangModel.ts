/** @format */

import mongoose, { Schema } from 'mongoose';

const QuyenChucNangScheme = new Schema(
    {
        id_quyen: {
            type: String,
            required: true,
        },
        id_chuc_nang: {
            type: String,
            required: true,
        },

    },
    { timestamps: true }
);

const QuyenChucNangModel = mongoose.model('quyenchucnang', QuyenChucNangScheme);
export default QuyenChucNangModel;
