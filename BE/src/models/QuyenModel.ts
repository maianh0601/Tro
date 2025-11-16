/** @format */

import mongoose, { Schema } from 'mongoose';

const QuyensScheme = new Schema(
    {
        ten_quyen: {
            type: String,
            required: true,
        },
        trang_thai: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

const QuyensModel = mongoose.model('quyens', QuyensScheme);
export default QuyensModel;
