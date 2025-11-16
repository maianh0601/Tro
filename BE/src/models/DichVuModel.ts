/** @format */

import mongoose, { Schema } from 'mongoose';

const DichVuScheme = new Schema(
    {
        tien_dien : {
            type : Number,
            require: true
        },

        tien_nuoc: {
            type: Number,
            require: true
        },
        tien_wifi: {
            type: Number,
            require: true
        },
        trang_thai: {
            type: Number,
            default: 1
        }
        
    },
    { timestamps: true }
);

const DichVuModel = mongoose.model('Dich_vu', DichVuScheme);
export default DichVuModel;
